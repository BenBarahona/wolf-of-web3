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

type FarcasterState = {
  isMiniApp: boolean;
  isReady: boolean;
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
        // 👇 Si estamos en Farcaster mini app, esto debería resolver OK
        await sdk.actions.ready();
        console.log("[Farcaster] sdk.actions.ready() OK");
        setState({ isMiniApp: true, isReady: true });
      } catch (e) {
        console.warn(
          "[Farcaster] sdk.actions.ready() falló (probablemente no es MiniApp):",
          e
        );
        setState({ isMiniApp: false, isReady: true });
      }
    };

    if (typeof window !== "undefined") {
      void init();
    } else {
      setState({ isMiniApp: false, isReady: true });
    }
  }, []);

  return (
    <FarcasterContext.Provider value={state}>
      {children}
    </FarcasterContext.Provider>
  );
}
