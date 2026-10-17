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
  StatusEnvKeys,
  StatusEnvSource,
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
 * 关于运行时（当前是 Pages，需要 edge）：
 * - 站点当前部署在 Cloudflare Pages + @cloudflare/next-on-pages。该适配器只把声明了
 *   edge runtime 的路由打进 `_worker.js`，因此下面那行 `export const runtime = "edge"`
 *   必须保留；去掉它这条路由会退回 Node.js 运行时，Pages 上无法执行。
 * - 若将来迁移到 @opennextjs/cloudflare（Workers，Node.js 运行时 + nodejs_compat），
 *   必须删掉该行，否则适配器会拒绝这条路由。
 *
 * 关于环境变量（edge 上不能只依赖 process.env）：
 * - next-on-pages 生成的 `_worker.js` 里，`process.env` 只是包在 AsyncLocalStorage
 *   之上的 Proxy（见其 generateGlobalJs），在请求作用域外取值会直接抛错；某些部署
 *   形态下 `process` 根本不存在。原来只读 process.env，异常又被外层漏掉，于是整条
 *   路由变成 500。
 * - 它自己的 getRequestContext() 读的就是
 *   `globalThis[Symbol.for("__cloudflare-request-context__")].env`
 *   （见 packages/next-on-pages/src/api/getRequestContext.ts），所以这里按同一约定
 *   先直接取该 Symbol，取不到再退回 process.env；每个键单独 try/catch，
 *   一条路径抛错不影响另一条。
 * - 响应里的 envSource / envKeys 只说明「凭据有没有读到」，不含任何凭据内容。
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

/**
 * 运行时声明：当前部署在 Cloudflare Pages + @cloudflare/next-on-pages，该适配器要求
 * 路由处理器声明 edge runtime，否则运行时直接 500。
 * 迁移到 @opennextjs/cloudflare（Workers）时删掉这一行。
 */
export const runtime = "edge";

/** 始终在请求时执行，避免被静态化后在构建期就去打上游接口 */
export const dynamic = "force-dynamic";

/** 需要从环境变量里读取的键（全部可选） */
const ENV_GITHUB_TOKEN = "GITHUB_TOKEN";
const ENV_OBS_USERNAME = "OBS_USERNAME";
const ENV_OBS_PASSWORD = "OBS_PASSWORD";

/** 需要读取的全部键，顺序即优先级 */
const ENV_KEYS = [ENV_GITHUB_TOKEN, ENV_OBS_USERNAME, ENV_OBS_PASSWORD] as const;

/**
 * next-on-pages 存放请求上下文（含 env）的全局 Symbol。
 * 与 `getRequestContext()` 取自同一位置；直接读它可以避免把适配器包 import 进 edge
 * bundle（该包入口还导出了依赖 fs / esbuild 的构建期工具）。
 */
const REQUEST_CONTEXT_SYMBOL = Symbol.for("__cloudflare-request-context__");

/** 解析后的环境变量：凭据只在本进程内存里，不写日志、不进响应 */
interface ProxyEnv {
  /** 实际读到值的那条路径，取不到时为 none */
  readonly source: StatusEnvSource;
  readonly githubToken: string;
  readonly obsUsername: string;
  readonly obsPassword: string;
}

/** 读取单个键；Proxy 取值与不存在的 process 都可能抛错，所以逐键收敛 */
function readEnvValue(bag: unknown, key: string): string {
  if (bag === null || typeof bag !== "object") {
    return "";
  }
  try {
    const value = (bag as Record<string, unknown>)[key];
    if (typeof value !== "string") {
      return "";
    }
    // 密码可能有意包含首尾空白，保留原样；其余键去掉首尾空白
    return key === ENV_OBS_PASSWORD ? value : value.trim();
  } catch {
    return "";
  }
}

/** 从请求上下文取 env；在请求作用域外读该 Proxy 会抛 TypeError，按取不到处理 */
function readRequestContextEnv(): unknown {
  try {
    const holder = globalThis as unknown as Record<symbol, unknown>;
    const context = holder[REQUEST_CONTEXT_SYMBOL];
    if (context === null || typeof context !== "object") {
      return null;
    }
    return (context as { env?: unknown }).env ?? null;
  } catch {
    return null;
  }
}

/** 退回 process.env；edge 上它可能是 AsyncLocalStorage 的 Proxy，也可能根本不存在 */
function readProcessEnv(): unknown {
  try {
    if (typeof process === "undefined") {
      return null;
    }
    const bag: unknown = process.env;
    return bag ?? null;
  } catch {
    return null;
  }
}

/**
 * 先请求上下文、再 process.env；同一个键取第一个非空值。
 * 两条路径都取不到时 source 为 none：页面照常工作，只是少了 token 配额加成。
 */
function resolveEnv(): ProxyEnv {
  const sources: ReadonlyArray<readonly [StatusEnvSource, unknown]> = [
    ["requestContext", readRequestContextEnv()],
    ["processEnv", readProcessEnv()],
  ];

  const values: Record<string, string> = {};
  let source: StatusEnvSource = "none";

  for (const [name, bag] of sources) {
    for (const key of ENV_KEYS) {
      if (values[key]) {
        continue;
      }
      const value = readEnvValue(bag, key);
      if (value !== "") {
        values[key] = value;
        if (source === "none") {
          source = name;
        }
      }
    }
  }

  return {
    source,
    githubToken: values[ENV_GITHUB_TOKEN] ?? "",
    obsUsername: values[ENV_OBS_USERNAME] ?? "",
    obsPassword: values[ENV_OBS_PASSWORD] ?? "",
  };
}

/** 三个凭据是否存在（只有布尔值，可安全放进响应） */
function envPresence(env: ProxyEnv): StatusEnvKeys {
  return {
    githubToken: env.githubToken !== "",
    obsUsername: env.obsUsername !== "",
    obsPassword: env.obsPassword !== "",
  };
}

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
 * token 由调用方从 resolveEnv() 的结果传入（不再直接读 process.env），
 * 不会写进日志，也不会出现在响应里；没有配置 token 时退化为匿名请求
 * （仍可用，只是限流 60 次/小时）。
 */
function githubHeaders(env: ProxyEnv): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "lingmo-org-status-proxy",
  };
  if (env.githubToken !== "") {
    headers.Authorization = `Bearer ${env.githubToken}`;
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
  env: ProxyEnv,
): Promise<{ payload: T; rateLimit: RateLimitInfo | null }> {
  const response = await fetchWithTimeout(url, githubHeaders(env), signal);
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
async function fetchRepoRuns(
  repo: string,
  signal: AbortSignal,
  env: ProxyEnv,
): Promise<RepoFetch> {
  const url = `${GITHUB_API}/repos/${GITHUB_OWNER}/${repo}/actions/runs?per_page=${TREND_LIMIT}&event=push`;
  const { payload, rateLimit } = await fetchGithub<GithubRunsPayload>(url, signal, env);
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
async function fetchIsoProgress(
  signal: AbortSignal,
  env: ProxyEnv,
): Promise<RunProgress | null> {
  const runsUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${ISO_REPO}/actions/runs?status=in_progress&per_page=1`;
  const { payload } = await fetchGithub<GithubRunsPayload>(runsUrl, signal, env);
  const running: GithubRunPayload | undefined = (payload.workflow_runs ?? [])[0];
  if (!running || typeof running.id !== "number") {
    return null;
  }

  const jobsUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${ISO_REPO}/actions/runs/${running.id}/jobs?per_page=10`;
  const { payload: jobsPayload } = await fetchGithub<GithubJobsPayload>(jobsUrl, signal, env);
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
async function fetchReleasePart(
  signal: AbortSignal,
  env: ProxyEnv,
): Promise<StatusApiReleasePart> {
  const url = `${GITHUB_API}/repos/${GITHUB_OWNER}/${ISO_REPO}/releases/latest`;
  let response: Response;
  try {
    response = await fetchWithTimeout(url, githubHeaders(env), signal);
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

/**
 * 把 OBS 凭据转成 Basic Auth 头；未配置时返回 null。
 * 凭据来自 resolveEnv()，只在本函数的返回值里出现，不写日志、不进入响应；
 * btoa 是 Web 标准接口（edge 与浏览器都有），凭据含非 Latin-1 字符时会抛错，
 * 这里按「未配置」处理，不影响其它区块。
 */
function obsAuthorization(env: ProxyEnv): string | null {
  const username = env.obsUsername;
  const password = env.obsPassword;
  if (username === "" || password === "") {
    return null;
  }
  try {
    return `Basic ${btoa(`${username}:${password}`)}`;
  } catch {
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
async function fetchObsPart(signal: AbortSignal, env: ProxyEnv): Promise<StatusApiObsPart> {
  const authorization = obsAuthorization(env);
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
async function buildStatusPayload(env: ProxyEnv): Promise<StatusApiResponse> {
  // 单请求各有 8 秒超时，这里只提供一个可传递的 signal（本请求内不会主动取消）
  const signal = new AbortController().signal;

  const [repoOutcome, releaseOutcome, isoOutcome, obsOutcome] = await Promise.allSettled([
    Promise.allSettled(STATUS_REPOS.map((repo) => fetchRepoRuns(repo, signal, env))),
    fetchReleasePart(signal, env),
    fetchIsoProgress(signal, env),
    fetchObsPart(signal, env),
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
    // 诊断用：凭据到底从哪条路径读到（只有来源与布尔值，没有凭据内容）
    envSource: env.source,
    envKeys: envPresence(env),
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

/** 缓存状态：HIT 命中；MISS 本次实时聚合；SKIP 缓存不可用或读写失败（本次跳过缓存） */
type CacheState = "HIT" | "MISS" | "SKIP";

/** 统一的 JSON 响应：带上缓存策略、「实时 / 缓存」标记与环境变量来源 */
function jsonResponse(payload: StatusApiResponse, cacheState: CacheState): NextResponse {
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": CACHE_CONTROL,
      "X-Status-Cache": cacheState,
      "X-Status-Env": payload.envSource,
    },
  });
}

/** 失败发生的阶段：直接写进 500 响应，便于一次定位 */
type FailureStage = "env" | "cache" | "aggregate" | "cache-write" | "response";

/** 错误摘要里的凭据一律抹掉：上游报错信息可能夹带请求头内容 */
function redact(message: string, env: ProxyEnv): string {
  let text = message;
  for (const secret of [env.githubToken, env.obsPassword, env.obsUsername]) {
    if (secret.length >= 4 && text.includes(secret)) {
      text = text.split(secret).join("***");
    }
  }
  return text;
}

/** 把异常收敛成一行可读摘要（不含凭据原文） */
function summarizeError(error: unknown, env: ProxyEnv): string {
  const raw = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const text = redact(raw, env).replace(/\s+/g, " ").trim();
  if (text === "") {
    return "unknown";
  }
  return text.length > 240 ? `${text.slice(0, 240)}…` : text;
}

/**
 * 500 响应：把「哪个阶段失败、错误摘要、env 来源」直接写进 JSON。
 * 这里不用 NextResponse，保证错误路径本身不会再出问题；凭据原文经过 redact 抹除。
 */
function failureResponse(stage: FailureStage, error: unknown, env: ProxyEnv): Response {
  const body = {
    error: summarizeError(error, env),
    stage,
    envSource: env.source,
    envKeys: envPresence(env),
    fetchedAt: new Date().toISOString(),
  };
  return new Response(JSON.stringify(body), {
    status: 500,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Status-Cache": "SKIP",
      "X-Status-Env": env.source,
    },
  });
}

/**
 * GET /api/status
 *
 * 优先读边缘缓存；未命中则实时聚合一次并写回缓存。
 * 即使上游全部失败，也返回 200 + 逐段错误，让页面能展示降级内容。
 *
 * 只有本进程自身出错（解析环境变量、聚合、序列化、写缓存）才会走到 500，
 * 并且 500 一定是 JSON：{ error, stage, envSource, envKeys }，便于一眼定位。
 */
export async function GET(request: Request): Promise<Response> {
  /** 初始值：连环境变量都没解析出来时，失败响应仍然能给出 envSource: "none" */
  const initialEnv: ProxyEnv = {
    source: "none",
    githubToken: "",
    obsUsername: "",
    obsPassword: "",
  };
  let env = initialEnv;
  let stage: FailureStage = "env";

  try {
    env = resolveEnv();

    // 缓存全部包在 try/catch 里：拿不到、读失败、写失败都只是本次跳过缓存
    stage = "cache";
    const cache = edgeCache();
    let cacheState: CacheState = cache ? "MISS" : "SKIP";
    const cacheKey = new Request(new URL("/api/status", request.url).toString(), {
      method: "GET",
    });

    if (cache) {
      try {
        const hit = await cache.match(cacheKey);
        if (hit) {
          const cachedPayload = (await hit.json()) as StatusApiResponse;
          const age = Date.now() - Date.parse(cachedPayload.fetchedAt);
          // 自建年龄上限：边缘缓存若给的时间比预期长，超龄后重新聚合
          if (Number.isFinite(age) && age < CACHE_MAX_STALE_MS) {
            // 诊断字段用本次结果覆盖，保证 envSource 反映当前请求真实情况
            return jsonResponse(
              { ...cachedPayload, envSource: env.source, envKeys: envPresence(env) },
              "HIT",
            );
          }
        }
      } catch {
        // 缓存读取 / 解析失败：本次跳过缓存，照常实时聚合
        cacheState = "SKIP";
      }
    }

    stage = "aggregate";
    const payload = await buildStatusPayload(env);

    if (cache) {
      stage = "cache-write";
      try {
        // 写缓存用独立的 Response 对象：写失败只影响缓存标记，不影响本次数据
        await cache.put(cacheKey, jsonResponse(payload, "MISS"));
      } catch {
        cacheState = "SKIP";
      }
    }

    stage = "response";
    return jsonResponse(payload, cacheState);
  } catch (error) {
    return failureResponse(stage, error, env);
  }
}
