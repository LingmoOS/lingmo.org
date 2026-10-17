import { NextResponse } from "next/server";
import {
  ISO_REPO,
  STATUS_REPOS,
  actionsUrl,
  describeHttpError,
  normalizeStatus,
  readRateLimit,
  toReleaseInfo,
  toTrendItem,
  toWorkflowRun,
  type GithubReleasePayload,
  type GithubRunPayload,
  type GithubRunsPayload,
} from "@/lib/buildStatus";
import type {
  ObsPackageResult,
  RateLimitInfo,
  RunProgress,
  RunStep,
  RunTrendItem,
  StatusApiIsoPart,
  StatusApiObsPart,
  StatusApiReleasePart,
  StatusApiRepoResult,
  StatusApiResponse,
  WorkflowRun,
} from "@/types";

/**
 * 「构建状态」页的数据聚合代理
 *
 * 为什么需要它：
 * - 浏览器直连 api.github.com 时未认证配额只有 60 次/小时/IP，而直连一轮刷新要
 *   8 次 GitHub 请求（7 个仓库 + 1 次最新发布），自动刷新只能退到 9 分钟一次；
 *   放到服务端后可以带 token（5000 次/小时），并在这里做一次聚合 + 60 秒边缘缓存，
 *   页面每次刷新只打 1 个请求。
 * - OBS（api.opensuse.org）需要 Basic Auth 且没有 CORS 头，浏览器永远读不到；
 *   凭据放在服务端环境变量里，由这里代取并精简后返回。
 *
 * 失败降级：任何一段上游失败都只把该段标成 { ok: false, error }，HTTP 仍返回 200，
 * 页面据此逐块展示，不会因为一个上游抖动而整页空白。
 *
 * 关于运行时：
 * - 本仓库已从 @cloudflare/next-on-pages 迁移到 @opennextjs/cloudflare（见提交 9e13fea），
 *   OpenNext 以 Node.js 运行时（nodejs_compat）执行 route handler；显式声明
 *   `export const runtime = "edge"` 会被适配器判为不支持，要么构建期报错、要么运行时 500。
 *   因此这里与其它 API 路由一致，不声明 runtime。
 * - 如果将来改回 next-on-pages，需要在这里补上 `export const runtime = "edge";`。
 */

/** 上游请求超时时间（毫秒）：单段超时只影响该段，不影响整次响应 */
const REQUEST_TIMEOUT_MS = 8_000;

/** 趋势条保留的运行次数 */
const TREND_LIMIT = 20;

/** OBS 结果最多返回多少条（按状态优先排序后截断） */
const OBS_RESULT_LIMIT = 40;

/**
 * 响应缓存策略：边缘缓存 60 秒，过期后 5 分钟内仍可先用旧数据再后台刷新。
 * 具体是否被 Cloudflare 边缘缓存，还取决于该路由是否命中了站点的缓存规则。
 */
const CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=300";

/** 自建的兜底上限：即使边缘缓存给的时间更长，超过这个年龄的数据也重新聚合 */
const CACHE_MAX_STALE_MS = 300_000;

const GITHUB_API = "https://api.github.com";
const GITHUB_OWNER = "LingmoOS";
const OBS_API = "https://api.opensuse.org";
const OBS_PROJECT = "home:LingmoOS";

/** 让路由始终在请求时执行，避免被静态化后在构建期就去打上游接口 */
export const dynamic = "force-dynamic";

/** 带错误标识的上游失败，便于逐段返回 { ok: false, error } */
class UpstreamError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(code);
    this.name = "UpstreamError";
    this.code = code;
  }
}

/** 把 Promise.allSettled 的失败原因收敛成页面认识的错误标识 */
function reasonCode(reason: unknown): string {
  if (reason instanceof UpstreamError) {
    return reason.code;
  }
  if (reason instanceof DOMException && reason.name === "AbortError") {
    return "aborted";
  }
  return "network";
}

/**
 * 构造 GitHub 请求头。
 * token 只从这里读取，不会写进日志，也不会出现在响应里；
 * 没有配置 token 时退化为匿名请求（仍可用，只是限流 60 次/小时）。
 */
function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "lingmo-org-status-proxy",
  };
  const token = (process.env.GITHUB_TOKEN ?? "").trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/** 带超时的 fetch：超时与原请求取消都会让 promise 以 AbortError 结束 */
async function fetchWithTimeout(
  url: string,
  headers: Record<string, string>,
  signal: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal.addEventListener("abort", onAbort, { once: true });
  try {
    return await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
  }
}

/** 请求 GitHub 并把 HTTP / JSON 失败统一转成 UpstreamError */
async function fetchGithub<T>(
  url: string,
  signal: AbortSignal,
): Promise<{ payload: T; rateLimit: RateLimitInfo | null }> {
  const response = await fetchWithTimeout(url, githubHeaders(), signal);
  const rateLimit = readRateLimit(response);
  if (!response.ok) {
    throw new UpstreamError(describeHttpError(response));
  }
  try {
    return { payload: (await response.json()) as T, rateLimit };
  } catch {
    throw new UpstreamError("network");
  }
}

/** 单个仓库的聚合结果 */
interface RepoFetch {
  repo: string;
  run: WorkflowRun | null;
  trend: RunTrendItem[];
  rateLimit: RateLimitInfo | null;
}

/**
 * 读取单个仓库最近 20 次 push 运行：
 * 第一条作为「最新一次」，整段同时用于趋势条，因此一个仓库只花 1 次请求。
 */
async function fetchRepoRuns(repo: string, signal: AbortSignal): Promise<RepoFetch> {
  const url = `${GITHUB_API}/repos/${GITHUB_OWNER}/${repo}/actions/runs?per_page=${TREND_LIMIT}&event=push`;
  const { payload, rateLimit } = await fetchGithub<GithubRunsPayload>(url, signal);
  const runs = payload.workflow_runs ?? [];
  const latest = runs[0];
  return {
    repo,
    run: latest ? toWorkflowRun(repo, latest) : null,
    trend: runs.slice(0, TREND_LIMIT).map(toTrendItem),
    rateLimit,
  };
}

/** `actions/runs/{id}/jobs` 中的步骤字段 */
interface GithubStepPayload {
  number?: number | null;
  name?: string | null;
  status?: string | null;
  conclusion?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
}

/** `actions/runs/{id}/jobs` 中的作业字段 */
interface GithubJobPayload {
  name?: string | null;
  status?: string | null;
  conclusion?: string | null;
  steps?: GithubStepPayload[] | null;
}

/** `actions/runs/{id}/jobs` 响应 */
interface GithubJobsPayload {
  jobs?: GithubJobPayload[] | null;
}

/** 把接口步骤转成页面结构 */
function toRunStep(payload: GithubStepPayload): RunStep {
  return {
    number: payload.number ?? 0,
    name: payload.name ?? "",
    status: payload.status ?? "unknown",
    conclusion: payload.conclusion ?? null,
    startedAt: payload.started_at ?? null,
    completedAt: payload.completed_at ?? null,
  };
}

/**
 * 读取 lingmo-builder 当前运行「正在哪一步」。
 * 没有进行中的运行（或拿不到 jobs）时返回 null，页面据此不显示进度区块。
 */
async function fetchIsoProgress(signal: AbortSignal): Promise<RunProgress | null> {
  const runsUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${ISO_REPO}/actions/runs?status=in_progress&per_page=1`;
  const { payload } = await fetchGithub<GithubRunsPayload>(runsUrl, signal);
  const running: GithubRunPayload | undefined = (payload.workflow_runs ?? [])[0];
  if (!running || typeof running.id !== "number") {
    return null;
  }

  const jobsUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${ISO_REPO}/actions/runs/${running.id}/jobs?per_page=10`;
  const { payload: jobsPayload } = await fetchGithub<GithubJobsPayload>(jobsUrl, signal);
  const jobs = jobsPayload.jobs ?? [];
  // 一个构建通常只有一个作业；有多个时优先取正在执行的那个
  const job = jobs.find((item) => (item.status ?? "") === "in_progress") ?? jobs[0];
  const steps = (job?.steps ?? []).map(toRunStep);
  // 「正在执行」优先；否则取最后一个已完成的步骤，让页面始终有具体动作可展示
  const currentStep =
    steps.find((step) => step.status === "in_progress") ??
    [...steps].reverse().find((step) => step.status === "completed") ??
    null;

  return {
    runNumber: running.run_number ?? 0,
    htmlUrl: running.html_url ?? actionsUrl(ISO_REPO),
    status: normalizeStatus(running.status ?? "unknown", running.conclusion ?? null),
    steps,
    currentStep,
    completedSteps: steps.filter((step) => step.status === "completed").length,
    totalSteps: steps.length,
  };
}

/** 读取最新发布；404 表示仓库确实还没有发布，与读取失败区分开 */
async function fetchReleasePart(signal: AbortSignal): Promise<StatusApiReleasePart> {
  const url = `${GITHUB_API}/repos/${GITHUB_OWNER}/${ISO_REPO}/releases/latest`;
  let response: Response;
  try {
    response = await fetchWithTimeout(url, githubHeaders(), signal);
  } catch (error) {
    return { ok: false, error: reasonCode(error), release: null, missing: false };
  }

  if (response.status === 404) {
    return { ok: true, release: null, missing: true };
  }
  if (!response.ok) {
    return { ok: false, error: describeHttpError(response), release: null, missing: false };
  }

  try {
    const payload = (await response.json()) as GithubReleasePayload;
    return { ok: true, release: toReleaseInfo(ISO_REPO, payload), missing: false };
  } catch {
    return { ok: false, error: "network", release: null, missing: false };
  }
}

/** 读取 XML 属性值（OBS 返回的都是简单字符串） */
function readAttr(attrs: string, name: string): string {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(attrs);
  return match?.[1] ? decodeXml(match[1]) : "";
}

/** 还原 XML 里最常见的几种转义 */
function decodeXml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCharCode(Number(code)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * 解析 OBS `_result` 的 XML。
 *
 * 为了不新增 XML 解析依赖，按 OBS 固定的结构逐条抽取：
 *   <resultlist>
 *     <result repository="…" arch="…">
 *       <status package="…" code="succeeded"><details>…</details></status>
 *     </result>
 *   </resultlist>
 * 结构与预期不符时只会得到空数组，不会抛异常。
 */
function parseObsResult(xml: string): ObsPackageResult[] {
  const results: ObsPackageResult[] = [];
  const resultRe = /<result\b([^>]*?)(?:\/>|>([\s\S]*?)<\/result>)/g;
  let resultMatch: RegExpExecArray | null;
  while ((resultMatch = resultRe.exec(xml)) !== null) {
    const repository = readAttr(resultMatch[1] ?? "", "repository");
    const arch = readAttr(resultMatch[1] ?? "", "arch");
    const inner = resultMatch[2] ?? "";
    const statusRe = /<status\b([^>]*?)(?:\/>|>([\s\S]*?)<\/status>)/g;
    let statusMatch: RegExpExecArray | null;
    while ((statusMatch = statusRe.exec(inner)) !== null) {
      const attrs = statusMatch[1] ?? "";
      const detailMatch = /<details>([\s\S]*?)<\/details>/.exec(statusMatch[2] ?? "");
      results.push({
        package: readAttr(attrs, "package"),
        repository,
        arch,
        // 不同 OBS 版本的属性名不同：新版本用 code，旧版本用 state
        status: readAttr(attrs, "code") || readAttr(attrs, "state") || "unknown",
        details: decodeXml(detailMatch?.[1] ?? "").trim(),
      });
    }
  }
  return results;
}

/** 让失败 / 进行中的包排在前面，其余按原顺序；页面先显示需要关注的结果 */
const OBS_PRIORITY: Record<string, number> = {
  failed: 0,
  broken: 0,
  unresolvable: 0,
  blocked: 1,
  building: 1,
  scheduled: 1,
  dispatching: 1,
  unknown: 2,
  succeeded: 3,
  disabled: 4,
  excluded: 4,
};

/** 对 OBS 结果排序（稳定排序：同优先级保持上游顺序） */
function sortObsResults(results: ObsPackageResult[]): ObsPackageResult[] {
  return results
    .map((item, index) => ({ item, index, priority: OBS_PRIORITY[item.status.toLowerCase()] ?? 2 }))
    .sort((left, right) => left.priority - right.priority || left.index - right.index)
    .map((entry) => entry.item);
}

/** 读取 OBS 凭据并转成 Basic Auth 头；未配置时返回 null */
function obsAuthorization(): string | null {
  const username = (process.env.OBS_USERNAME ?? "").trim();
  const password = process.env.OBS_PASSWORD ?? "";
  if (!username || !password) {
    return null;
  }
  try {
    // 凭据只在本函数的返回值里出现，不写日志、不进入响应
    return `Basic ${btoa(`${username}:${password}`)}`;
  } catch {
    // 凭据含非 Latin-1 字符时 btoa 会抛错，按未配置处理
    return null;
  }
}

/**
 * 读取 OBS 构包结果并精简。
 *
 * 端点选择：`/build/{project}/_result?view=status` 返回按仓库 / 架构分组的
 * 逐包状态；个别实例不接受 view 参数时退一步用默认视图重试一次。
 * 无凭据、鉴权失败、网络失败都返回 available:false + reason，不影响其它区块。
 */
async function fetchObsPart(signal: AbortSignal): Promise<StatusApiObsPart> {
  const authorization = obsAuthorization();
  if (!authorization) {
    return { available: false, reason: "noCredentials", results: [], total: 0 };
  }

  const headers = { Authorization: authorization, Accept: "application/xml, text/xml" };
  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${OBS_API}/build/${OBS_PROJECT}/_result?view=status`,
      headers,
      signal,
    );
    if (!response.ok && response.status !== 401 && response.status !== 403) {
      response = await fetchWithTimeout(`${OBS_API}/build/${OBS_PROJECT}/_result`, headers, signal);
    }
  } catch (error) {
    const aborted = reasonCode(error) === "aborted";
    return { available: false, reason: aborted ? "aborted" : "network", results: [], total: 0 };
  }

  if (response.status === 401 || response.status === 403) {
    return { available: false, reason: "auth", results: [], total: 0 };
  }
  if (!response.ok) {
    return { available: false, reason: "network", results: [], total: 0 };
  }

  let xml: string;
  try {
    xml = await response.text();
  } catch {
    return { available: false, reason: "network", results: [], total: 0 };
  }

  const all = parseObsResult(xml);
  if (all.length === 0 && !xml.includes("<result")) {
    // 有响应但结构与预期不符（例如返回了错误页），避免把「空」当成「全部成功」
    return { available: false, reason: "parse", results: [], total: 0 };
  }

  return {
    available: true,
    reason: "",
    results: sortObsResults(all).slice(0, OBS_RESULT_LIMIT),
    total: all.length,
  };
}

/**
 * 一次性聚合所有数据。
 * 用 Promise.allSettled 逐段隔离：任一上游失败只影响该段，HTTP 仍然是 200。
 */
async function buildStatusPayload(): Promise<StatusApiResponse> {
  // 单请求各有 8 秒超时，这里只提供一个可传递的 signal（本请求内不会主动取消）
  const signal = new AbortController().signal;

  const [repoOutcome, releaseOutcome, isoOutcome, obsOutcome] = await Promise.allSettled([
    Promise.allSettled(STATUS_REPOS.map((repo) => fetchRepoRuns(repo, signal))),
    fetchReleasePart(signal),
    fetchIsoProgress(signal),
    fetchObsPart(signal),
  ]);

  /** 仓库段落：逐个映射，失败的仓库单独标记 */
  const repos: StatusApiRepoResult[] = [];
  let rateLimit: RateLimitInfo | null = null;

  if (repoOutcome.status === "fulfilled") {
    repoOutcome.value.forEach((entry, index) => {
      const repo = STATUS_REPOS[index] ?? "";
      if (entry.status === "fulfilled") {
        const value = entry.value;
        if (rateLimit === null && value.rateLimit !== null) {
          rateLimit = value.rateLimit;
        }
        repos.push({ repo: value.repo, ok: true, run: value.run, trend: value.trend });
        return;
      }
      repos.push({ repo, ok: false, error: reasonCode(entry.reason) });
    });
  } else {
    STATUS_REPOS.forEach((repo) => {
      repos.push({ repo, ok: false, error: reasonCode(repoOutcome.reason) });
    });
  }

  // ISO 趋势直接复用 lingmo-builder 的那一段运行列表，不再额外请求
  const isoRuns = repos.find((item) => item.repo === ISO_REPO)?.trend ?? [];

  const iso: StatusApiIsoPart =
    isoOutcome.status === "fulfilled"
      ? { ok: true, runs: isoRuns, current: isoOutcome.value }
      : { ok: false, error: reasonCode(isoOutcome.reason), runs: isoRuns, current: null };

  const release: StatusApiReleasePart =
    releaseOutcome.status === "fulfilled"
      ? releaseOutcome.value
      : { ok: false, error: reasonCode(releaseOutcome.reason), release: null, missing: false };

  const obs: StatusApiObsPart =
    obsOutcome.status === "fulfilled"
      ? obsOutcome.value
      : { available: false, reason: "network", results: [], total: 0 };

  return {
    source: "proxy",
    fetchedAt: new Date().toISOString(),
    repos,
    rateLimit,
    iso,
    release,
    obs,
  };
}

/** Cloudflare 的 Cache API 形状（只在 Worker / Pages 环境下存在） */
interface EdgeCacheLike {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

/** 取边缘缓存；本地 next dev（Node）没有 caches，返回 null 后直接实时聚合 */
function edgeCache(): EdgeCacheLike | null {
  try {
    // Cloudflare 的 caches.default 不在 DOM 类型里，先转成 unknown 再取值
    const storage = (globalThis as unknown as { caches?: { default?: EdgeCacheLike } }).caches;
    return storage?.default ?? null;
  } catch {
    return null;
  }
}

/** 统一的 JSON 响应：带上缓存策略与「实时 / 缓存」标记 */
function jsonResponse(payload: StatusApiResponse, cacheState: "HIT" | "MISS"): NextResponse {
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": CACHE_CONTROL,
      "X-Status-Cache": cacheState,
    },
  });
}

/**
 * GET /api/status
 *
 * 优先读边缘缓存；未命中则实时聚合一次并写回缓存。
 * 即使上游全部失败，也返回 200 + 逐段错误，让页面能展示降级内容。
 */
export async function GET(request: Request): Promise<Response> {
  const cache = edgeCache();
  const cacheKey = new Request(new URL("/api/status", request.url).toString(), { method: "GET" });

  if (cache) {
    try {
      const hit = await cache.match(cacheKey);
      if (hit) {
        const cachedPayload = (await hit.json()) as StatusApiResponse;
        const age = Date.now() - Date.parse(cachedPayload.fetchedAt);
        // 自建年龄上限：边缘缓存若给的时间比预期长，超龄后重新聚合
        if (Number.isFinite(age) && age < CACHE_MAX_STALE_MS) {
          return jsonResponse(cachedPayload, "HIT");
        }
      }
    } catch {
      // 缓存读取 / 解析失败都不影响正常返回，继续实时聚合
    }
  }

  const payload = await buildStatusPayload();
  const response = jsonResponse(payload, "MISS");

  if (cache) {
    try {
      await cache.put(cacheKey, response.clone());
    } catch {
      // 写入缓存失败时退化为每次实时聚合
    }
  }

  return response;
}
