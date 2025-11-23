// components/GlobalErrorBoundary.tsx
"use client";

import React from "react";
// si usás sonner, descomentá esto:
// import { toast } from "sonner";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class GlobalErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("GlobalErrorBoundary caught error:", error, info);
    // toast.error(`Error: ${error.message}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-bold mb-2">
              Algo se rompió en la app 😅
            </h1>
            <p className="text-sm mb-4 break-words">
              {this.state.error?.message}
            </p>
            <p className="text-xs opacity-70">
              (Este mensaje es solo para debug, no para producción final)
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
