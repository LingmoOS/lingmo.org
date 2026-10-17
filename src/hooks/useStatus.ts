"use client";

/**
 * 「构建状态」页面的数据获取 Hook
 *
 * 设计要点：
 * - 优先请求同源的服务端聚合代理 `/api/status`（1 个请求，鉴权与聚合都在服务端完成）；
 * - 代理不可用 / 返回异常时自动回落到浏览器直连公开接口，页面不会白屏；
 * - 不会抛异常：任何一块失败都只影响自身区块，页面始终有内容；
 * - 自动刷新间隔按数据来源区分：代理 60 秒，直连 540 秒（保护未认证的
 *   GitHub 60 次/小时配额），两者都由 buildStatus 中的常量统一控制；
 * - 命中本地缓存且数据仍新鲜时跳过首次请求，进一步节省请求配额。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MIN_MANUAL_REFRESH_MS,
  STATUS_CACHE_KEY,
  cacheTtlFor,
  fallbackSnapshot,
  fetchStatusDirect,
  fetchStatusFromProxy,
  refreshIntervalFor,
} from "@/lib/buildStatus";
import type { StatusSnapshot } from "@/types";

/** 本地缓存结构 */
interface CachedStatus {
  savedAt: number;
  snapshot: StatusSnapshot;
}

/** 校验缓存结构，避免历史版本数据导致渲染异常 */
function isStatusSnapshot(value: unknown): value is StatusSnapshot {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const snapshot = value as Partial<StatusSnapshot>;
  return (
    Array.isArray(snapshot.repos) &&
    typeof snapshot.fetchedAt === "string" &&
    (snapshot.source === "proxy" || snapshot.source === "direct") &&
    (snapshot.freshness === "live" || snapshot.freshness === "cached")
  );
}

/** 读取本地缓存；不存在、不可用或结构不符时返回 null */
function readCache(): CachedStatus | null {
  try {
    const raw = window.localStorage.getItem(STATUS_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<CachedStatus>;
    if (typeof parsed.savedAt !== "number" || !isStatusSnapshot(parsed.snapshot)) {
      return null;
    }
    // 超过一天的历史缓存直接丢弃
    if (Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
      return null;
    }
    return { savedAt: parsed.savedAt, snapshot: parsed.snapshot };
  } catch {
    // 隐私模式等场景下 localStorage 不可用，视为没有缓存
    return null;
  }
}

/** 写入本地缓存；失败时静默忽略（缓存只是优化项） */
function writeCache(snapshot: StatusSnapshot): void {
  try {
    const payload: CachedStatus = { savedAt: Date.now(), snapshot };
    window.localStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // 忽略
  }
}

/** 命中本地缓存时，把新鲜度改写为「缓存」，让页面如实展示数据来源 */
function asCached(snapshot: StatusSnapshot): StatusSnapshot {
  return { ...snapshot, freshness: "cached" };
}

export interface StatusState {
  snapshot: StatusSnapshot | null;
  /** 首次加载且没有任何数据可展示 */
  loading: boolean;
  /** 手动刷新进行中 */
  refreshing: boolean;
  /** 立即刷新（带最小间隔保护） */
  refresh: () => void;
  /** 当前是否允许手动刷新 */
  canRefresh: boolean;
  /** 当前自动刷新间隔（毫秒），随数据来源变化 */
  intervalMs: number;
}

export function useStatus(): StatusState {
  const [snapshot, setSnapshot] = useState<StatusSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  /** 当前进行中的请求，重新刷新或组件卸载时取消 */
  const controllerRef = useRef<AbortController | null>(null);

  /** 最近一次真正发起请求的时间，用于判断缓存是否新鲜 */
  const lastFetchRef = useRef<number>(0);

  /** 组件是否仍然挂载 */
  const mountedRef = useRef(true);

  /** 始终指向最新的 load 函数，供定时器回调调用（避免闭包过期） */
  const loadRef = useRef<(force: boolean) => Promise<void>>(async () => {});

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  /** 拉取全部数据：先代理、失败再直连，两者都不会让页面白屏 */
  const load = useCallback(async (force: boolean): Promise<void> => {
    const cached = readCache();

    if (!force && cached !== null && Date.now() - cached.savedAt < cacheTtlFor(cached.snapshot.source)) {
      // 缓存足够新鲜：直接使用，不再消耗任何接口配额
      lastFetchRef.current = cached.savedAt;
      setSnapshot(asCached(cached.snapshot));
      setLoading(false);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    lastFetchRef.current = Date.now();

    if (cached !== null) {
      // 先把旧数据渲染出来，避免整页空白
      setSnapshot(asCached(cached.snapshot));
      setLoading(false);
    }

    // 优先走服务端聚合代理；任何异常都视为「代理不可用」，继续回落到直连
    let next: StatusSnapshot | null = null;
    try {
      next = await fetchStatusFromProxy(controller.signal);
    } catch {
      next = null;
    }

    if (next === null && !controller.signal.aborted) {
      try {
        next = await fetchStatusDirect(controller.signal);
      } catch {
        next = null;
      }
    }

    if (!mountedRef.current || controller.signal.aborted) {
      return;
    }
    if (next === null) {
      // 两个来源都失败：有旧数据就继续用旧数据（并让按钮恢复可用）；
      // 完全没有任何数据时用兜底快照渲染页面结构，避免整页空白
      if (cached === null) {
        setSnapshot(fallbackSnapshot());
      }
      setLoading(false);
      setRefreshing(false);
      setNow(Date.now());
      return;
    }

    setSnapshot(next);
    writeCache(next);
    setLoading(false);
    setRefreshing(false);
    setNow(Date.now());
  }, []);

  loadRef.current = load;

  /** 首次挂载：拉取一次（命中新鲜缓存时不会发起请求） */
  useEffect(() => {
    void loadRef.current(false);
  }, []);

  /** 当前数据来源对应的自动刷新间隔；代理可用时是 60 秒，直连时是 540 秒 */
  const intervalMs = refreshIntervalFor(snapshot?.source ?? "proxy");

  /** 定时自动刷新；页面切到后台时暂停轮询，回到前台时补一次 */
  useEffect(() => {
    let intervalId: number | undefined;

    const startInterval = () => {
      if (intervalId === undefined) {
        intervalId = window.setInterval(() => {
          void loadRef.current(true);
        }, intervalMs);
      }
    };

    const stopInterval = () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopInterval();
        return;
      }
      startInterval();
      if (Date.now() - lastFetchRef.current >= intervalMs) {
        void loadRef.current(true);
      }
    };

    if (document.visibilityState === "visible") {
      startInterval();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopInterval();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [intervalMs]);

  /** 手动刷新冷却中时每秒推进一次状态，让按钮能自动恢复可用 */
  const canRefresh = !refreshing && now - lastFetchRef.current >= MIN_MANUAL_REFRESH_MS;

  useEffect(() => {
    if (canRefresh) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [canRefresh]);

  const refresh = useCallback((): void => {
    if (Date.now() - lastFetchRef.current < MIN_MANUAL_REFRESH_MS) {
      return;
    }
    setRefreshing(true);
    setNow(Date.now());
    void loadRef.current(true);
  }, []);

  return { snapshot, loading, refreshing, refresh, canRefresh, intervalMs };
}
