"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import the cursor component with no SSR to avoid hydration issues
const CursorGlow = dynamic(
  () => import('@/components/ui/cursor-glow').then(mod => ({ default: mod.CursorGlow })),
  { ssr: false }
);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {children}
      {isMounted && <CursorGlow />}
    </>
  );
}