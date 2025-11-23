// src/lib/farcaster.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { isCeloProvider } from "../walletProvider";

type FarcasterState = {
  isMiniApp: boolean;
  isReady: boolean;
  fid?: number;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  authToken?: string;
};

const initialState: FarcasterState = {
  isMiniApp: false,
  isReady: false,
};

const FarcasterContext = createContext<FarcasterState>(initialState);

export const useFarcaster = () => useContext(FarcasterContext);

export function FarcasterProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<FarcasterState>(initialState);

  useEffect(() => {
    // 👇 Si el provider NO es Celo, ignoramos Farcaster por completo
    if (!isCeloProvider) {
      setState({ isMiniApp: false, isReady: true });
      return;
    }

    const init = async () => {
      try {
        if (typeof window === "undefined") {
          setState({ isMiniApp: false, isReady: true });
          return;
        }

        // 1) Detectar si realmente estamos en un MiniApp
        const inMiniApp = await sdk.isInMiniApp?.();
        console.log("[Farcaster] isInMiniApp:", inMiniApp);

        if (!inMiniApp) {
          setState({ isMiniApp: false, isReady: true });
          return;
        }

        // 2) Obtener contexto (user, etc.)
        const ctx: any = await sdk.context;
        const user = ctx?.user;

        // 3) QuickAuth -> token opcional
        let authToken: string | undefined;
        try {
          const tokenResult: any = await sdk.quickAuth?.getToken?.();
          if (tokenResult && typeof tokenResult === "object" && "token" in tokenResult) {
            authToken = tokenResult.token;
          }
        } catch (e) {
          console.warn("[Farcaster] quickAuth.getToken falló (no grave):", e);
        }

        // 4) Muy importante: esconder el splash screen
        try {
          await sdk.actions.ready();
          console.log("[Farcaster] sdk.actions.ready() OK");
        } catch (e) {
          console.warn("[Farcaster] sdk.actions.ready() falló:", e);
        }

        // 5) Guardar info en el contexto
        setState({
          isMiniApp: true,
          isReady: true,
          fid: user?.fid,
          username: user?.username,
          displayName: user?.displayName,
          avatarUrl: user?.pfpUrl || user?.pfp?.url,
          authToken,
        });
      } catch (err) {
        console.error("[Farcaster] error inicializando MiniApp:", err);
        setState({ isMiniApp: false, isReady: true });
      }
    };

    void init();
  }, []);

  return (
    <FarcasterContext.Provider value={state}>
      {children}
    </FarcasterContext.Provider>
  );
}
