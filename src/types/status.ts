/**
 * 「构建状态」页面相关数据类型
 *
 * 说明：这里只声明从公开接口（GitHub REST / OBS REST）读取到的字段，
 * 不引入任何密钥或私有数据，写法与官网其它类型保持一致。
 *
 * 其中 StatusApi* 系列是 `/api/status` 服务端聚合代理的返回结构。
 * 代理与前端共用这一套类型，避免两边结构各自漂移。
 */

/** 归一化后的构建状态（由 GitHub Actions 的 status + conclusion 推导） */
export type BuildStatus =
  | "success"
  | "failure"
  | "running"
  | "cancelled"
  | "queued"
  | "skipped"
  | "unknown";

/** 数据来源：服务端聚合代理（/api/status），或浏览器直连上游公开接口 */
export type StatusSource = "proxy" | "direct";

/** 数据新鲜度：本次抓取（live），或来自页面 / 边缘缓存（cached） */
export type StatusFreshness = "live" | "cached";

/**
 * 代理读取 Cloudflare 环境变量时实际走通的那条路径（仅用于诊断，不含凭据内容）。
 * - requestContext：从请求上下文（next-on-pages 的 getRequestContext().env）读到；
 * - processEnv：退回到 process.env 读到；
 * - none：两条路径都没有读到任何配置。
 */
export type StatusEnvSource = "requestContext" | "processEnv" | "none";

/** 三个凭据是否读到（布尔值，永远不含凭据原文） */
export interface StatusEnvKeys {
  githubToken: boolean;
  obsUsername: boolean;
  obsPassword: boolean;
}

/**
 * 回落到浏览器直连时，服务端代理此前失败的原因。
 * 页面用它来区分「代理 500（服务端错误）」与「直连配额耗尽」两种完全不同的情况。
 */
export type ProxyFailure = "server" | "network" | "invalid";

/** 单个仓库最新一次 GitHub Actions 运行 */
export interface WorkflowRun {
  /** 仓库名（不含 owner 前缀） */
  repo: string;
  /** 工作流名称，例如 "Build ISO of Lingmo OS"；接口未返回时用仓库名兜底 */
  workflowName: string;
  /** 归一化状态，用于决定徽章颜色与文案 */
  status: BuildStatus;
  /** 原始 status 字段（queued / in_progress / completed 等） */
  rawStatus: string;
  /** 原始 conclusion 字段（success / failure / cancelled 等，未完成时为 null） */
  rawConclusion: string | null;
  /** 分支名 */
  branch: string;
  /** 提交短哈希（7 位） */
  shortSha: string;
  /** 本次运行编号 */
  runNumber: number;
  /** 创建时间（ISO 字符串） */
  createdAt: string;
  /** 最近更新时间（ISO 字符串） */
  updatedAt: string;
  /** 该次运行的页面地址 */
  htmlUrl: string;
}

/** GitHub 速率限制信息（仅用于友好提示，不影响页面渲染） */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  /** 配额重置时间（ISO 字符串），接口未返回时为 null */
  resetAt: string | null;
}

/** 趋势条单项：一次历史运行的结论与时间（每个仓库最近 N 次） */
export interface RunTrendItem {
  /** 运行编号，用于给趋势条生成稳定的 key */
  runNumber: number;
  /** 归一化状态，决定趋势条的颜色 */
  status: BuildStatus;
  /** 原始 conclusion 字段（未完成时为 null） */
  rawConclusion: string | null;
  /** 创建时间（ISO 字符串） */
  createdAt: string;
  /** 该次运行的页面地址 */
  htmlUrl: string;
}

/** 一次运行中的单个步骤（来自 `actions/runs/{id}/jobs` 的 steps 字段） */
export interface RunStep {
  /** 步骤序号（接口从 1 开始） */
  number: number;
  name: string;
  /** 原始 status 字段：queued / in_progress / completed */
  status: string;
  /** 原始 conclusion 字段（未完成时为 null） */
  conclusion: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

/** 当前运行的「正在哪一步」进度 */
export interface RunProgress {
  runNumber: number;
  htmlUrl: string;
  /** 整条运行归一化后的状态 */
  status: BuildStatus;
  steps: RunStep[];
  /** 正在执行的步骤；没有进行中的步骤时取最后一个已完成步骤 */
  currentStep: RunStep | null;
  /** 已完成步骤数 */
  completedSteps: number;
  /** 步骤总数 */
  totalSteps: number;
}

/** 单个仓库的请求结果 */
export interface RepoStatusResult {
  repo: string;
  /** 该仓库最新的运行；仓库还没有任何 push 运行时为 null */
  run: WorkflowRun | null;
  /** 失败原因描述（仅在请求失败时有值） */
  error?: string;
  /** 最近 N 次运行的结论，用于趋势条；接口不可用时省略 */
  trend?: RunTrendItem[];
}

/** 一次仓库状态请求的汇总结果 */
export interface RepoStatusSummary {
  results: RepoStatusResult[];
  rateLimit: RateLimitInfo | null;
}

/** 最新发布的单个资产文件（ISO 会被切成 .part-aa / .part-ab 等分片） */
export interface ReleaseAsset {
  name: string;
  /** 字节数 */
  size: number;
  downloadCount: number;
  downloadUrl: string;
}

/** lingmo-builder 的最新发布（用于展示 ISO 构建产物） */
export interface ReleaseInfo {
  tagName: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  assets: ReleaseAsset[];
}

/** OBS 的单条构包结果（浏览器通常因鉴权 / CORS 读不到，属于尽力而为） */
export interface ObsPackageResult {
  package: string;
  repository: string;
  arch: string;
  status: string;
  details: string;
}

/** 页面一次完整刷新的数据快照 */
export interface StatusSnapshot {
  repos: RepoStatusResult[];
  rateLimit: RateLimitInfo | null;
  release: ReleaseInfo | null;
  /** 上游仓库还没有发布（404）时为 true，用于区分「没有发布」与「读取失败」 */
  releaseMissing: boolean;
  obs: ObsOutcomeSnapshot;
  /** 本次数据的来源：proxy 为服务端聚合，direct 为浏览器直连 */
  source: StatusSource;
  /** 本次数据是刚抓取（live）还是来自缓存（cached） */
  freshness: StatusFreshness;
  /** ISO 构建当前运行的分步进度；直连模式下拿不到 jobs/steps，值为 null */
  isoProgress: RunProgress | null;
  /** ISO 构建仓库最近若干次运行，用于趋势条 */
  isoTrend: RunTrendItem[];
  /** 本次数据获取完成的时间（ISO 字符串） */
  fetchedAt: string;
  /**
   * 直连模式下服务端代理此前失败的原因：server 为 5xx，network 为连不上 / 超时，
   * invalid 为返回非 JSON 或结构不符；代理正常时没有这个字段。
   */
  proxyError?: ProxyFailure;
}

/** OBS 区块的数据快照 */
export interface ObsOutcomeSnapshot {
  available: boolean;
  results: ObsPackageResult[];
  /** 失败原因标识：cors / auth / network / aborted / noCredentials / parse */
  reason: string;
  /** 代理侧筛选前的包结果总数；直连模式下省略 */
  total?: number;
}

/**
 * `/api/status` 中单个仓库的返回结果。
 * 用 ok 显式区分成功与失败，失败段落不影响其它段落。
 */
export interface StatusApiRepoResult {
  repo: string;
  ok: boolean;
  /** 失败原因（ok 为 false 时给出） */
  error?: string;
  /** 最近一次 push 运行；仓库没有记录时为 null */
  run?: WorkflowRun | null;
  /** 最近 N 次运行（含最新一次），用于趋势条 */
  trend?: RunTrendItem[];
}

/** `/api/status` 中 ISO 构建部分 */
export interface StatusApiIsoPart {
  ok: boolean;
  error?: string;
  /** lingmo-builder 最近 N 次运行 */
  runs: RunTrendItem[];
  /** 当前正在运行的详细进度；没有进行中的运行时为 null */
  current: RunProgress | null;
}

/** `/api/status` 中最新发布部分 */
export interface StatusApiReleasePart {
  ok: boolean;
  error?: string;
  release: ReleaseInfo | null;
  /** 仓库确实没有发布（404）时为 true，用于区分「没有发布」与「读取失败」 */
  missing: boolean;
}

/** `/api/status` 中 OBS 部分（已按状态排序并截断） */
export interface StatusApiObsPart {
  available: boolean;
  reason: string;
  results: ObsPackageResult[];
  /** 截断前的包结果总数 */
  total: number;
}

/** `/api/status` 的完整返回结构 */
export interface StatusApiResponse {
  /** 固定为 proxy，供前端判断响应确实来自本代理 */
  source: "proxy";
  fetchedAt: string;
  repos: StatusApiRepoResult[];
  rateLimit: RateLimitInfo | null;
  iso: StatusApiIsoPart;
  release: StatusApiReleasePart;
  obs: StatusApiObsPart;
  /** 环境变量是从哪条路径读到的（诊断用） */
  envSource: StatusEnvSource;
  /** 三个凭据是否存在（诊断用，只有布尔值） */
  envKeys: StatusEnvKeys;
}