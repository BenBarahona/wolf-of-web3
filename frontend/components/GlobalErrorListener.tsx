// components/GlobalErrorListener.tsx
"use client";

import { useEffect } from "react";
// import { toast } from "sonner";

export function GlobalErrorListener() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("🌋 window error:", event.error || event.message);
      // toast.error(`window error: ${event.message}`);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("💥 unhandled rejection:", event.reason);
      // toast.error(`unhandled rejection: ${String(event.reason)}`);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
