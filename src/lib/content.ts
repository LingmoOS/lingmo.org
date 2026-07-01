import type { DownloadItem, MirrorItem, ReleaseNote, BlogPost, GalleryItem, Sponsor, FaqItem } from "@/types";

// Cache for content data
const cache = new Map<string, any>();

async function fetchJSON<T>(path: string): Promise<T> {
  if (cache.has(path)) return cache.get(path) as T;
  const res = await fetch(path);
  const data = await res.json();
  cache.set(path, data);
  return data as T;
}

export async function getDownloads(): Promise<DownloadItem[]> {
  return fetchJSON<DownloadItem[]>("/content/downloads.json");
}

export async function getMirrors(): Promise<MirrorItem[]> {
  return fetchJSON<MirrorItem[]>("/content/mirrors.json");
}

export async function getReleaseNotes(): Promise<ReleaseNote[]> {
  const items = await fetchJSON<ReleaseNote[]>("/content/releases.json");
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return fetchJSON<BlogPost[]>("/content/blog.json");
}

export async function getGallery(): Promise<GalleryItem[]> {
  return fetchJSON<GalleryItem[]>("/content/gallery.json");
}

export async function getSponsors(): Promise<Sponsor[]> {
  return fetchJSON<Sponsor[]>("/content/sponsors.json");
}

export async function getFaq(): Promise<FaqItem[]> {
  return fetchJSON<FaqItem[]>("/content/faq.json");
}

export function getDownloadUrl(type: "stable" | "beta" | "nightly"): string {
  return `/download/${type}`;
}
