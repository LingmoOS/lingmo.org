/**
 * 公开接口访问层（构建状态页专用）
 *
 * 约定：
 * - 只使用 React + 内置 fetch，不新增任何依赖；
 * - 优先请求同源的服务端聚合代理 `/api/status`（1 个请求，鉴权与缓存在服务端完成）；
 * - 代理不可用 / 返回异常时自动回落到浏览器直连 GitHub / OBS 公开接口，
 *   保证页面在任何情况下都有内容，不会白屏；
 * - 浏览器侧始终不持有任何 token；
 * - 所有函数都不会抛异常，失败时通过返回值表达错误，便于页面优雅降级；
 * - 所有网络请求都支持 AbortSignal，组件卸载时立即取消。
 */

import type {
  BuildStatus,
  ObsPackageResult,
  RateLimitInfo,
  ReleaseAsset,
  ReleaseInfo,
  RepoStatusResult,
  RepoStatusSummary,
  RunTrendItem,
  StatusApiResponse,
  StatusSnapshot,
  StatusSource,
  WorkflowRun,
} from "@/types";

/** GitHub REST API 根地址（公开仓库无需认证） */
const GITHUB_API = "https://api.github.com";

/** GitHub 组织名 */
const GITHUB_OWNER = "LingmoOS";

/** OBS 公开接口根地址（实测需要账号鉴权，属于尽力而为的数据源） */
const OBS_API = "https://api.opensuse.org";

/** 服务端聚合代理的同源路径 */
export const STATUS_API_PATH = "/api/status";

/** 需要展示 CI 状态的仓库列表（与需求给出的清单一致） */
export const STATUS_REPOS = [
  "lingmo-builder",
  "live-build",
  "live-boot",
  "live-config",
  "live-tools",
  "live-tasks",
  "lingmo-installer-config",
] as const;

/** 代表 ISO 构建状态的仓库（ISO 由 lingmo-builder 产出） */
export const ISO_REPO = "lingmo-builder";

/** 组织主页（失败兜底链接、「全部运行」入口） */
export const ORG_URL = `https://github.com/${GITHUB_OWNER}`;

/** 某个仓库的 Actions 页面 */
export function actionsUrl(repo: string): string {
  return `${ORG_URL}/${repo}/actions`;
}

/** 某个仓库的 Releases 页面 */
export function releasesUrl(repo: string): string {
  return `${ORG_URL}/${repo}/releases`;
}

/** OBS 项目名与监控页地址 */
export const OBS_PROJECT = "home:LingmoOS";
export const OBS_MONITOR_URL = `https://build.opensuse.org/project/monitor/${OBS_PROJECT}`;
export const OBS_API_URL = `${OBS_API}/build/${OBS_PROJECT}/_result`;

/**
 * 自动刷新间隔（毫秒）。
 *
 * 两种数据来源的请求成本不同，因此间隔也不同：
 *
 * - 走服务端代理（/api/status）：一轮刷新只有 1 个浏览器请求，代理侧再聚合上游
 *   并带 60 秒边缘缓存，因此可以放到 60 秒；
 * - 浏览器直连：一轮刷新要为 7 个仓库各发一次请求，再加一次「最新发布」，
 *   共 8 次 GitHub 请求（OBS 那次算在另一个域名，不占 GitHub 配额）；
 *   未认证的 GitHub REST 接口限制为 60 次/小时/IP，只有 540 秒（9 分钟）
 *   才能稳定留在配额内（加载 1 次 + 约 6 次定时刷新，约 56 次/小时）。
 *
 * 页面切到后台会暂停轮询，命中新鲜缓存时也不会请求接口。
 * 想更快看到最新状态，可使用页面上的「立即刷新」按钮（带 30 秒最小间隔）。
 */
export const REFRESH_INTERVAL_PROXY_MS = 60_000;
export const REFRESH_INTERVAL_DIRECT_MS = 540_000;

/** 按数据来源选择自动刷新间隔 */
export function refreshIntervalFor(source: StatusSource): number {
  return source === "proxy" ? REFRESH_INTERVAL_PROXY_MS : REFRESH_INTERVAL_DIRECT_MS;
}

/** 手动刷新的最小间隔（毫秒），避免连续点击把配额打满 */
export const MIN_MANUAL_REFRESH_MS = 30_000;

/**
 * 本地缓存的键名。
 * v2：快照结构新增了 source / freshness / isoProgress 等字段，
 * 换键名可以避免读到旧结构导致页面显示错乱。
 */
export const STATUS_CACHE_KEY = "lingmo-status-cache-v2";

/**
 * 本地缓存有效时长（毫秒）。
 * 代理模式下上游有 60 秒边缘缓存，本地缓存不必更长；
 * 直连模式下缓存久一点，减少对未认证配额（60 次/小时）的消耗。
 */
export const STATUS_CACHE_TTL_PROXY_MS = 60_000;
export const STATUS_CACHE_TTL_DIRECT_MS = 300_000;

/** 按数据来源选择本地缓存有效时长 */
export function cacheTtlFor(source: StatusSource): number {
  return source === "proxy" ? STATUS_CACHE_TTL_PROXY_MS : STATUS_CACHE_TTL_DIRECT_MS;
}

/** 单个请求的超时时间（毫秒），避免请求悬挂导致页面一直处于加载中 */
const REQUEST_TIMEOUT_MS = 20_000;

/** 构造请求头：GitHub 要求带 UA 与 API 版本，否则可能返回 403 */
function githubHeaders(): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/**
 * 带超时的 fetch：超时与外部取消都会让 promise 以 AbortError 结束。
 * 通过中间 AbortController 实现，避免依赖 AbortSignal.timeout。
 */
async function fetchWithTimeout(
  url: string,
  signal: AbortSignal,
  headers?: Record<string, string>,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal.addEventListener("abort", onAbort, { once: true });
  try {
    return await fetch(url, headers ? { signal: controller.signal, headers } : { signal: controller.signal });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
  }
}

/** 访问 GitHub 公开接口（附带 GitHub 专用请求头） */
async function requestJson(url: string, signal: AbortSignal): Promise<Response> {
  return fetchWithTimeout(url, signal, githubHeaders());
}

/** 访问同源的聚合代理（不附加 GitHub 专用请求头） */
async function requestSameOrigin(url: string, signal: AbortSignal): Promise<Response> {
  return fetchWithTimeout(url, signal);
}

/** 判断是否为主动取消（组件卸载 / 请求超时），这类错误不提示给用户 */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** 从响应头读取速率限制信息 */
export function readRateLimit(response: Response): RateLimitInfo | null {
  const limit = Number(response.headers.get("x-ratelimit-limit"));
  const remaining = Number(response.headers.get("x-ratelimit-remaining"));
  if (!Number.isFinite(limit) || !Number.isFinite(remaining)) {
    return null;
  }
  const reset = Number(response.headers.get("x-ratelimit-reset"));
  return {
    limit,
    remaining,
    resetAt: Number.isFinite(reset) && reset > 0 ? new Date(reset * 1000).toISOString() : null,
  };
}

/**
 * 统一把 HTTP 失败转成错误描述（页面再按 i18n key 展示文案）。
 * rateLimited 会带上距离配额重置的分钟数。
 * 服务端代理复用同一套错误标识，保证两个来源的提示文案一致。
 */
export function describeHttpError(response: Response): string {
  if (response.status === 403 || response.status === 429) {
    const reset = Number(response.headers.get("x-ratelimit-reset"));
    if (Number.isFinite(reset) && reset > 0) {
      const minutes = Math.max(1, Math.ceil((reset * 1000 - Date.now()) / 60_000));
      return `rateLimited:${minutes}`;
    }
    return "rateLimited:unknown";
  }
  if (response.status === 404) {
    return "notFound";
  }
  return `http:${response.status}`;
}

/** 把未知异常转成错误描述；AbortError 交由调用方忽略 */
function describeFetchError(error: unknown): string {
  return isAbortError(error) ? "aborted" : "network";
}

/** GitHub Actions 运行对象（仅声明用到的字段） */
export interface GithubRunPayload {
  /** 运行 ID，用于继续查询该次运行的 jobs/steps */
  id?: number | null;
  name?: string | null;
  status?: string | null;
  conclusion?: string | null;
  head_branch?: string | null;
  head_sha?: string | null;
  run_number?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  html_url?: string | null;
}

/** GitHub Actions 运行列表响应 */
export interface GithubRunsPayload {
  workflow_runs?: GithubRunPayload[] | null;
}

/** 已知的 conclusion 取值，用于把接口枚举收敛到受控集合 */
const KNOWN_CONCLUSIONS: readonly string[] = [
  "success",
  "failure",
  "cancelled",
  "skipped",
  "timed_out",
  "action_required",
  "neutral",
  "stale",
];

/** 把 conclusion 收敛到已知取值，未知值统一记为 unknown，避免在类型上退化成 any */
function toKnownConclusion(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  return KNOWN_CONCLUSIONS.includes(value) ? value : "unknown";
}

/** 由 status + conclusion 推导出页面展示用的归一化状态 */
export function normalizeStatus(rawStatus: string, conclusion: string | null): BuildStatus {
  const status = rawStatus.toLowerCase();
  if (status === "in_progress" || status === "running") {
    return "running";
  }
  if (status !== "completed") {
    // queued / requested / waiting / pending 等都归入「排队中」
    return "queued";
  }
  switch (conclusion) {
    case "success":
    case "neutral":
      return "success";
    case "failure":
    case "timed_out":
    case "action_required":
      return "failure";
    case "cancelled":
    case "stale":
      return "cancelled";
    case "skipped":
      return "skipped";
    default:
      return "unknown";
  }
}

/** 把 GitHub 的运行对象转换成页面使用的结构 */
export function toWorkflowRun(repo: string, payload: GithubRunPayload): WorkflowRun {
  const rawStatus = payload.status ?? "unknown";
  const rawConclusion = toKnownConclusion(payload.conclusion ?? null);
  const sha = payload.head_sha ?? "";
  return {
    repo,
    workflowName: payload.name ?? repo,
    status: normalizeStatus(rawStatus, rawConclusion),
    rawStatus,
    rawConclusion,
    branch: payload.head_branch ?? "",
    shortSha: sha.slice(0, 7),
    runNumber: payload.run_number ?? 0,
    createdAt: payload.created_at ?? "",
    updatedAt: payload.updated_at ?? payload.created_at ?? "",
    htmlUrl: payload.html_url ?? actionsUrl(repo),
  };
}

/** 把 GitHub 的运行对象压缩成趋势条需要的最小信息 */
export function toTrendItem(payload: GithubRunPayload): RunTrendItem {
  const rawStatus = payload.status ?? "unknown";
  const rawConclusion = toKnownConclusion(payload.conclusion ?? null);
  return {
    runNumber: payload.run_number ?? 0,
    status: normalizeStatus(rawStatus, rawConclusion),
    rawConclusion,
    createdAt: payload.created_at ?? payload.updated_at ?? "",
    htmlUrl: payload.html_url ?? "",
  };
}

/**
 * 单个仓库的请求结果（含该次响应里的配额信息）。
 * 注意：这里不能写成 `interface RepoStatusFetch extends RepoStatusResult`，
 * 因为 RepoStatusResult 是 import type 引入的类型，接口继承要求它在运行时也存在。
 */
interface RepoStatusFetch {
  repo: string;
  run: WorkflowRun | null;
  trend: RunTrendItem[];
  error?: string;
  rateLimit: RateLimitInfo | null;
}

/** 读取单个仓库最近的若干次运行（第一条即最新一次，同时用于趋势条） */
async function fetchRepoStatus(repo: string, signal: AbortSignal): Promise<RepoStatusFetch> {
  // 只取 push 触发的运行，避免 tag / schedule 触发挤掉主分支结果
  const url = `${GITHUB_API}/repos/${GITHUB_OWNER}/${repo}/actions/runs?per_page=20&event=push`;
  let response: Response;
  try {
    response = await requestJson(url, signal);
  } catch (error) {
    return { repo, run: null, trend: [], error: describeFetchError(error), rateLimit: null };
  }

  const rateLimit = readRateLimit(response);

  if (!response.ok) {
    return { repo, run: null, trend: [], error: describeHttpError(response), rateLimit };
  }

  let payload: GithubRunsPayload;
  try {
    payload = (await response.json()) as GithubRunsPayload;
  } catch {
    return { repo, run: null, trend: [], error: "network", rateLimit };
  }

  // 接口按时间倒序返回，第一条即最新一次运行
  const runs = payload.workflow_runs ?? [];
  const latest = runs[0];
  return {
    repo,
    run: latest ? toWorkflowRun(repo, latest) : null,
    trend: runs.map(toTrendItem),
    rateLimit,
  };
}

/**
 * 并发读取所有仓库的最近若干次运行。
 * 不会抛异常：任何仓库失败都只影响自身卡片，其余卡片照常展示。
 */
export async function fetchRepoStatuses(signal: AbortSignal): Promise<RepoStatusSummary> {
  const settled = await Promise.all(STATUS_REPOS.map((repo) => fetchRepoStatus(repo, signal)));

  const results: RepoStatusResult[] = settled.map((item) => {
    const result: RepoStatusResult = { repo: item.repo, run: item.run };
    if (item.error) {
      result.error = item.error;
    }
    if (item.trend.length > 0) {
      result.trend = item.trend;
    }
    return result;
  });

  const firstWithQuota = settled.find((item) => item.rateLimit !== null);

  return {
    results,
    rateLimit: firstWithQuota?.rateLimit ?? null,
  };
}

/** GitHub Release 资产字段 */
export interface GithubAssetPayload {
  name?: string | null;
  size?: number | null;
  download_count?: number | null;
  browser_download_url?: string | null;
}

/** GitHub Release 字段 */
export interface GithubReleasePayload {
  tag_name?: string | null;
  name?: string | null;
  published_at?: string | null;
  html_url?: string | null;
  assets?: GithubAssetPayload[] | null;
}

/** 把 GitHub Release 载荷转换成页面结构（代理与直连共用） */
export function toReleaseInfo(repo: string, payload: GithubReleasePayload): ReleaseInfo {
  const assets: ReleaseAsset[] = (payload.assets ?? []).map((asset) => ({
    name: asset.name ?? "unknown",
    size: asset.size ?? 0,
    downloadCount: asset.download_count ?? 0,
    downloadUrl: asset.browser_download_url ?? "",
  }));

  return {
    tagName: payload.tag_name ?? "",
    name: payload.name ?? payload.tag_name ?? "",
    publishedAt: payload.published_at ?? "",
    htmlUrl: payload.html_url ?? releasesUrl(repo),
    assets,
  };
}

/**
 * 读取 lingmo-builder 的最新发布（ISO 构建产物）。
 * 失败或仓库还没有发布时返回 null，由页面展示「暂无发布信息」与仓库链接。
 */
export async function fetchLatestRelease(
  repo: string,
  signal: AbortSignal,
): Promise<ReleaseInfo | null> {
  let response: Response;
  try {
    response = await requestJson(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${repo}/releases/latest`,
      signal,
    );
  } catch {
    return null;
  }
  if (!response.ok) {
    return null;
  }

  let payload: GithubReleasePayload;
  try {
    payload = (await response.json()) as GithubReleasePayload;
  } catch {
    return null;
  }

  return toReleaseInfo(repo, payload);
}

/** OBS `_result` 接口中的单条构包结果 */
interface ObsResultPayload {
  package?: string | null;
  status?: string | null;
  details?: string | null;
  arch?: string | null;
  repository?: string | null;
}

/** OBS `_result` 接口响应 */
interface ObsBuildPayload {
  result?: ObsResultPayload[] | null;
}

/** OBS 读取结果：available 为 false 时页面只展示跳转链接与说明 */
export interface ObsStatusOutcome {
  available: boolean;
  results: ObsPackageResult[];
  /** 失败原因标识，例如 "cors" / "auth" / "network" / "aborted" */
  reason: string;
}

/**
 * 尽力读取 OBS 的公开接口。
 *
 * 实测 api.opensuse.org 需要 SUSE 开发者账号鉴权：匿名请求返回 401，
 * 且响应不带 Access-Control-Allow-Origin，浏览器里必然读不到数据。
 * 因此失败属于预期情况，页面会退化为一个指向 OBS 项目监控页的链接，
 * 且不影响仓库 CI 与 ISO 两个区块的展示。
 * 配置了 OBS_USERNAME / OBS_PASSWORD 后，数据由服务端代理
 * `/api/status` 提供，不再走这条直连路径。
 */
export async function fetchObsStatus(signal: AbortSignal): Promise<ObsStatusOutcome> {
  let response: Response;
  try {
    response = await requestJson(OBS_API_URL, signal);
  } catch (error) {
    return { available: false, results: [], reason: isAbortError(error) ? "aborted" : "cors" };
  }

  if (!response.ok) {
    const reason = response.status === 401 || response.status === 403 ? "auth" : "network";
    return { available: false, results: [], reason };
  }

  try {
    const payload = (await response.json()) as ObsBuildPayload;
    const results: ObsPackageResult[] = (payload.result ?? []).map((item) => ({
      package: item.package ?? "",
      repository: item.repository ?? "",
      arch: item.arch ?? "",
      status: item.status ?? "unknown",
      details: item.details ?? "",
    }));
    return { available: true, results, reason: "" };
  } catch {
    return { available: false, results: [], reason: "network" };
  }
}

/* ------------------------------------------------------------------ *
 * 直连模式：代理不可用时的兜底路径
 * ------------------------------------------------------------------ */

/**
 * 浏览器直连上游接口，聚合成与代理一致的快照结构。
 *
 * 直连拿不到 `jobs/steps`（会额外消耗 1~2 次配额），因此 isoProgress 固定为 null，
 * ISO 卡片在这种模式下不显示分步进度。
 */
export async function fetchStatusDirect(signal: AbortSignal): Promise<StatusSnapshot> {
  const [repoStatus, release, obs] = await Promise.all([
    fetchRepoStatuses(signal),
    fetchLatestRelease(ISO_REPO, signal),
    fetchObsStatus(signal),
  ]);

  const isoTrend =
    repoStatus.results.find((item) => item.repo === ISO_REPO)?.trend ?? [];

  return {
    repos: repoStatus.results,
    rateLimit: repoStatus.rateLimit,
    release,
    releaseMissing: release === null,
    obs: { available: obs.available, results: obs.results, reason: obs.reason },
    source: "direct",
    freshness: "live",
    isoProgress: null,
    isoTrend,
    fetchedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ *
 * 代理模式：优先路径
 * ------------------------------------------------------------------ */

/** 校验代理返回的结构，避免异常响应把页面带崩 */
function isStatusApiResponse(value: unknown): value is StatusApiResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const payload = value as Partial<StatusApiResponse>;
  return (
    payload.source === "proxy" &&
    typeof payload.fetchedAt === "string" &&
    Array.isArray(payload.repos) &&
    typeof payload.iso === "object" &&
    payload.iso !== null &&
    typeof payload.release === "object" &&
    payload.release !== null &&
    typeof payload.obs === "object" &&
    payload.obs !== null
  );
}

/** 把代理返回的段落映射成页面快照 */
function mapProxyPayload(payload: StatusApiResponse, fromCache: boolean): StatusSnapshot {
  const byRepo = new Map(payload.repos.map((item) => [item.repo, item] as const));

  // 按固定顺序还原仓库卡片，代理漏掉的仓库按失败处理，卡片仍然会出现
  const repos: RepoStatusResult[] = STATUS_REPOS.map((repo) => {
    const found = byRepo.get(repo);
    if (!found) {
      return { repo, run: null, error: "network" };
    }
    const result: RepoStatusResult = { repo, run: found.run ?? null };
    if (!found.ok) {
      result.error = found.error ?? "network";
    }
    if (Array.isArray(found.trend) && found.trend.length > 0) {
      result.trend = found.trend;
    }
    return result;
  });

  // 代理单独给出了 lingmo-builder 的运行列表：仓库段落缺失趋势时用它补齐
  const isoRuns = Array.isArray(payload.iso.runs) ? payload.iso.runs : [];
  const isoIndex = repos.findIndex((item) => item.repo === ISO_REPO);
  const isoEntry = repos[isoIndex];
  if (isoEntry && isoRuns.length > 0 && isoEntry.trend === undefined) {
    repos[isoIndex] = { ...isoEntry, trend: isoRuns };
  }

  const obsResults = Array.isArray(payload.obs.results) ? payload.obs.results : [];

  return {
    repos,
    rateLimit: payload.rateLimit ?? null,
    release: payload.release.release,
    // 代理明确区分了「没有发布（missing）」与「读取失败（ok 为 false）」
    releaseMissing: payload.release.ok ? payload.release.missing : false,
    obs: {
      available: payload.obs.available,
      results: obsResults,
      reason: payload.obs.reason,
      total: typeof payload.obs.total === "number" ? payload.obs.total : obsResults.length,
    },
    isoProgress: payload.iso.ok ? payload.iso.current : null,
    isoTrend: isoRuns,
    source: "proxy",
    freshness: fromCache ? "cached" : "live",
    fetchedAt: payload.fetchedAt,
  };
}

/**
 * 请求服务端聚合代理。
 *
 * 返回 null 表示代理不可用（未部署、超时、非 JSON、结构不符等），
 * 调用方据此回落到直连逻辑；不会抛异常。
 */
export async function fetchStatusFromProxy(signal: AbortSignal): Promise<StatusSnapshot | null> {
  let response: Response;
  try {
    response = await requestSameOrigin(STATUS_API_PATH, signal);
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  // 代理偶尔会被上层改写（例如返回 HTML 错误页），先看内容类型再解析
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return null;
  }

  if (!isStatusApiResponse(payload)) {
    return null;
  }

  // 代理用 X-Status-Cache 标记本次响应是实时抓取还是命中边缘缓存
  const cacheState = (response.headers.get("x-status-cache") ?? "").toUpperCase();
  const snapshot = mapProxyPayload(payload, cacheState === "HIT");

  /**
   * 代理结构正常但所有仓库都失败了（例如服务端出口 IP 被限流，或 token 失效），
   * 这时返回 null 让调用方改用浏览器直连：访客 IP 的配额与服务器不同，
   * 直连往往还能拿到数据。
   */
  if (snapshot.repos.length > 0 && snapshot.repos.every((item) => item.error !== undefined)) {
    return null;
  }

  return snapshot;
}

/**
 * 两个来源都失败、且本地也没有缓存时的兜底快照。
 *
 * 每张仓库卡片会显示「暂时无法获取」，页面结构照常渲染，
 * 不会留下空白页；用户还可以点「立即刷新」重试。
 */
export function fallbackSnapshot(): StatusSnapshot {
  return {
    repos: STATUS_REPOS.map((repo) => ({ repo, run: null, error: "network" })),
    rateLimit: null,
    release: null,
    releaseMissing: false,
    obs: { available: false, results: [], reason: "network" },
    source: "direct",
    freshness: "live",
    isoProgress: null,
    isoTrend: [],
    fetchedAt: new Date().toISOString(),
  };
}
