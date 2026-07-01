export interface DownloadItem {
  version: string;
  type: "stable" | "beta" | "nightly";
  releaseDate: string;
  iso: string;
  sha256: string;
  torrent?: string;
  mirrors?: string[];
  changelog?: string;
}

export interface Edition {
  id: string;
  name: string;
  recommended?: boolean;
  available: boolean;
}

export interface Architecture {
  id: string;
  label: string;
  available: boolean;
  recommended?: boolean;
  badge?: string;
}

export interface ArchInfo {
  available: boolean;
  size?: string;
  iso?: string;
  sha256?: string;
  torrent?: string;
}

export interface VersionEntry {
  version: string;
  type: "stable" | "beta" | "nightly";
  releaseDate: string;
  edition: string;
  architectures: Record<string, ArchInfo>;
  releaseNotes?: string;
  installationGuide?: string;
  systemRequirements?: string;
  mirrors?: string;
  reportIssue?: string;
}

export interface DownloadConfig {
  latest: string;
  editions: Edition[];
  architectures: Architecture[];
  versions: VersionEntry[];
  quickLinks: {
    sha256: string;
    releaseNotes: string;
    installationGuide: string;
    systemRequirements: string;
    mirrors: string;
    reportIssue: string;
  };
}

export interface MirrorItem {
  name: string;
  url: string;
  location: string;
}

export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  content: string;
  type: "stable" | "beta" | "nightly";
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
  excerpt: string;
  cover?: string;
}

export interface DocItem {
  slug: string;
  title: string;
  category: string;
  order: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  src: string;
  width: number;
  height: number;
  category: string;
}

export interface DonateOption {
  id: string;
  method: string;
  icon: string;
  url?: string;
  qrCode?: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Sponsor {
  name: string;
  tier: "platinum" | "gold" | "silver" | "bronze" | "backer";
  url: string;
  logo?: string;
  amount?: number;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}
