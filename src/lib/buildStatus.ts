/**
 * 公开接口访问层（构建状态页专用）
 *
 * 约定：
 * - 只使用 React + 内置 fetch，不新增任何依赖，也不使用任何密钥 / token；
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
  WorkflowRun,
} from "@/types";

/** GitHub REST API 根地址（公开仓库无需认证） */
const GITHUB_API = "https://api.github.com";

/** GitHub 组织名 */
const GITHUB_OWNER = "LingmoOS";

/** OBS 公开接口根地址（实测需要账号鉴权，属于尽力而为的数据源） */
const OBS_API = "https://api.opensuse.org";

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
 * 未认证的 GitHub REST 接口限制为 60 次/小时/IP，而本页每次刷新需要为
 * 每个仓库各发一次请求（当前 7 个仓库），再加上一次「最新发布」请求，
 * 一轮刷新共 8 次：
 *   - 60 秒刷新  -> 一小时约 480 次，必然限流；
 *   - 480 秒刷新 -> 一小时约 60 次，刚好卡在配额上限；
 *   - 540 秒刷新 -> 加载时一次 + 6 次定时刷新，一小时约 56 次，仍有余量。
 * 因此这里取 540 秒（9 分钟），既留在配额内，也不会因为边界浮动而限流。
 * 页面切到后台会暂停轮询，命中新鲜缓存时也不会请求接口。
 *
 * 想更快看到最新状态，可使用页面上的「立即刷新」按钮（带 30 秒最小间隔）。
 */
export const REFRESH_INTERVAL_MS = 540_000;

/** 手动刷新的最小间隔（毫秒），避免连续点击把配额打满 */
export const MIN_MANUAL_REFRESH_MS = 30_000;

/** 本地缓存的键名与有效时长（毫秒）：命中缓存即可跳过页面加载时的首次请求 */
export const STATUS_CACHE_KEY = "lingmo-status-cache-v1";
export const STATUS_CACHE_TTL_MS = 300_000;

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
async function requestJson(url: string, signal: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal.addEventListener("abort", onAbort, { once: true });
  try {
    return await fetch(url, { signal: controller.signal, headers: githubHeaders() });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
  }
}

/** 判断是否为主动取消（组件卸载 / 请求超时），这类错误不提示给用户 */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** 从响应头读取速率限制信息 */
function readRateLimit(response: Response): RateLimitInfo | null {
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
 * 统一把 HTTP 失败转成错误描述（页面再按 i18n key 展示中文文案）。
 * rateLimited 会带上距离配额重置的分钟数。
 */
function describeHttpError(response: Response): string {
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
interface GithubRunPayload {
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
interface GithubRunsPayload {
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
function toWorkflowRun(repo: string, payload: GithubRunPayload): WorkflowRun {
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

/**
 * 单个仓库的请求结果（含该次响应里的配额信息）。
 * 注意：这里不能写成 `interface RepoStatusFetch extends RepoStatusResult`，
 * 因为 RepoStatusResult 是 import type 引入的类型，接口继承要求它在运行时也存在。
 */
interface RepoStatusFetch {
  repo: string;
  run: WorkflowRun | null;
  error?: string;
  rateLimit: RateLimitInfo | null;
}

/** 读取单个仓库最新一次运行 */
async function fetchRepoStatus(repo: string, signal: AbortSignal): Promise<RepoStatusFetch> {
  // 只取 push 触发的最新一次运行，避免 tag / schedule 触发挤掉主分支结果
  const url = `${GITHUB_API}/repos/${GITHUB_OWNER}/${repo}/actions/runs?per_page=1&event=push`;
  let response: Response;
  try {
    response = await requestJson(url, signal);
  } catch (error) {
    return { repo, run: null, error: describeFetchError(error), rateLimit: null };
  }

  const rateLimit = readRateLimit(response);

  if (!response.ok) {
    return { repo, run: null, error: describeHttpError(response), rateLimit };
  }

  let payload: GithubRunsPayload;
  try {
    payload = (await response.json()) as GithubRunsPayload;
  } catch {
    return { repo, run: null, error: "network", rateLimit };
  }

  // 接口按时间倒序返回，第一条即最新一次运行
  const latest = (payload.workflow_runs ?? [])[0];
  return { repo, run: latest ? toWorkflowRun(repo, latest) : null, rateLimit };
}

/**
 * 并发读取所有仓库的最新一次运行。
 * 不会抛异常：任何仓库失败都只影响自身卡片，其余卡片照常展示。
 */
export async function fetchRepoStatuses(signal: AbortSignal): Promise<RepoStatusSummary> {
  const settled = await Promise.all(STATUS_REPOS.map((repo) => fetchRepoStatus(repo, signal)));

  const results: RepoStatusResult[] = settled.map((item) => {
    const result: RepoStatusResult = { repo: item.repo, run: item.run };
    if (item.error) {
      result.error = item.error;
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
interface GithubAssetPayload {
  name?: string | null;
  size?: number | null;
  download_count?: number | null;
  browser_download_url?: string | null;
}

/** GitHub Release 字段 */
interface GithubReleasePayload {
  tag_name?: string | null;
  name?: string | null;
  published_at?: string | null;
  html_url?: string | null;
  assets?: GithubAssetPayload[] | null;
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