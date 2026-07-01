"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootNotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/404");
  }, [router]);

  return null;
}
