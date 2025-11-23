// app/providers.tsx
"use client";

import { CircleProvider } from "@/lib/circle";
import { Web3Provider } from "@/lib/contracts";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { GlobalErrorListener } from "@/components/GlobalErrorListener";
import { FarcasterProvider } from "@/lib/farcaster/FarcasterProvider";
import { isCeloProvider } from "@/lib/walletProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  // Árbol base (Circle + Web3 + errores)
  const coreTree = (
    <Web3Provider>
      <CircleProvider>
        <GlobalErrorListener />
        {children}
      </CircleProvider>
    </Web3Provider>
  );

  return (
    <GlobalErrorBoundary>
      {isCeloProvider ? (
        <FarcasterProvider>{coreTree}</FarcasterProvider>
      ) : (
        coreTree
      )}
    </GlobalErrorBoundary>
  );
}
