"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { sdk } from "@farcaster/miniapp-sdk";

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
    const init = async () => {
      try {
        // 1) Intentamos obtener contexto. Si falla, NO estamos en MiniApp.
        let ctx: any;
        try {
          ctx = await (sdk as any).context;
        } catch (e) {
          console.log("[Farcaster] No context -> probablemente NO MiniApp:", e);
          setState({
            isMiniApp: false,
            isReady: true,
          });
          return;
        }

        const user = ctx?.user;
        if (!user) {
          // Sin user en el contexto => lo tratamos como no-MiniApp
          setState({
            isMiniApp: false,
            isReady: true,
          });
          return;
        }

        // 2) Quick Auth -> conseguís un JWT (formato depende de la versión del SDK)
        let authToken: string | undefined;
        try {
          const tokenResult = await (sdk as any).quickAuth?.getToken?.();

          if (typeof tokenResult === "string") {
            authToken = tokenResult;
          } else if (tokenResult && typeof tokenResult === "object") {
            // probamos algunas keys típicas
            authToken =
              (tokenResult as any).token ??
              (tokenResult as any).jwt ??
              (tokenResult as any).accessToken ??
              undefined;
          }
        } catch (e) {
          console.warn(
            "[Farcaster] quickAuth.getToken falló (no es grave):",
            e
          );
        }

        // 3) Avisar que el MiniApp está listo
        try {
          await sdk.actions.ready();
        } catch (e) {
          console.warn("[Farcaster] sdk.actions.ready() falló:", e);
        }

        // 4) Guardamos estado del usuario
        setState({
          isMiniApp: true,
          isReady: true,
          fid: user?.fid,
          username: user?.username,
          displayName: user?.displayName,
          // según versión puede ser pfpUrl o pfp.url, probamos ambos
          avatarUrl: user?.pfpUrl || user?.pfp?.url,
          authToken,
        });
      } catch (err) {
        console.error("[Farcaster] error inicializando MiniApp:", err);
        setState({
          isMiniApp: false,
          isReady: true,
        });
      }
    };

    // Solo corre en el cliente
    if (typeof window !== "undefined") {
      void init();
    } else {
      setState({
        isMiniApp: false,
        isReady: true,
      });
    }
  }, []);

  return (
    <FarcasterContext.Provider value={state}>
      {children}
    </FarcasterContext.Provider>
  );
}
