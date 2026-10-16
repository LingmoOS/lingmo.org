/**
 * 「构建状态」页面相关数据类型
 *
 * 说明：这里只声明从公开接口（GitHub REST / OBS REST）读取到的字段，
 * 不引入任何密钥或私有数据，写法与官网其它类型保持一致。
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

/** 单个仓库的请求结果 */
export interface RepoStatusResult {
  repo: string;
  /** 该仓库最新的运行；仓库还没有任何 push 运行时为 null */
  run: WorkflowRun | null;
  /** 失败原因描述（仅在请求失败时有值） */
  error?: string;
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
  /** 本次数据获取完成的时间（ISO 字符串） */
  fetchedAt: string;
}

/** OBS 区块的数据快照 */
export interface ObsOutcomeSnapshot {
  available: boolean;
  results: ObsPackageResult[];
  /** 失败原因标识：cors / auth / network / aborted */
  reason: string;
}