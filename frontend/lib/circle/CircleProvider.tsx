// src/lib/circle/CircleProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { getCircleConfig } from "./api";
import type { UserSession, ChallengeResult } from "./types";
import { WALLET_PROVIDER, WalletProvider } from "../walletProvider";

interface CircleContextType {
  sdk: W3SSdk | null;
  appId: string | null;
  isInitialized: boolean;
  userSession: UserSession | null;
  setUserSession: (session: UserSession | null) => void;
  executeChallenge: (
    challengeId: string,
    callback?: (error: any, result?: ChallengeResult) => void
  ) => void;
  clearSession: () => void;
  deviceId: string | null;
  walletProvider: WalletProvider;
}

const CircleContext = createContext<CircleContextType>({
  sdk: null,
  appId: null,
  isInitialized: false,
  userSession: null,
  setUserSession: () => {},
  executeChallenge: () => {},
  clearSession: () => {},
  deviceId: null,
  walletProvider: WALLET_PROVIDER,
});

export const useCircle = () => {
  const context = useContext(CircleContext);
  if (!context) {
    throw new Error("useCircle must be used within a CircleProvider");
  }
  return context;
};

interface CircleProviderProps {
  children: React.ReactNode;
}

export function CircleProvider({ children }: CircleProviderProps) {
  const [sdk, setSdk] = useState<W3SSdk | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [userSession, setUserSessionState] = useState<UserSession | null>(
    () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("circle_user_session");
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch (e) {
            console.error("Failed to parse stored session:", e);
          }
        }
      }
      return null;
    }
  );

  useEffect(() => {
    const initSDK = async () => {
      try {
        console.log("[Circle] Wallet provider:", WALLET_PROVIDER);

        const config = await getCircleConfig();
        setAppId(config.appId);

        const deviceToken =
          typeof window !== "undefined"
            ? localStorage.getItem("deviceToken")
            : null;
        const deviceEncryptionKey =
          typeof window !== "undefined"
            ? localStorage.getItem("deviceEncryptionKey")
            : null;

        const sdkConfig: any = {
          appSettings: {
            appId: config.appId,
          },
        };

        const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (deviceToken && deviceEncryptionKey) {
          sdkConfig.loginConfigs = {
            deviceToken,
            deviceEncryptionKey,
          };

          if (facebookAppId) {
            sdkConfig.loginConfigs.facebook = {
              appId: facebookAppId,
              redirectUri:
                typeof window !== "undefined" ? window.location.origin : "",
            };
          }

          if (googleClientId) {
            sdkConfig.loginConfigs.google = {
              clientId: googleClientId,
              redirectUri:
                typeof window !== "undefined" ? window.location.origin : "",
            };
          }
        }

        const sdkInstance = new W3SSdk(sdkConfig);

        if (sdkInstance.getDeviceId) {
          try {
            const id = await sdkInstance.getDeviceId();
            setDeviceId(id);
            if (typeof window !== "undefined") {
              localStorage.setItem("deviceId", id);
            }
            console.log("Device ID retrieved:", id);
          } catch (error) {
            console.error("Failed to get device ID:", error);
          }
        }

        setSdk(sdkInstance);
        setIsInitialized(true);
        console.log("Circle SDK initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Circle SDK:", error);
      }
    };

    initSDK();
  }, []);

  useEffect(() => {
    if (sdk && userSession) {
      sdk.setAuthentication({
        userToken: userSession.userToken,
        encryptionKey: userSession.encryptionKey,
      });
      console.log("Circle SDK authenticated");
    }
  }, [sdk, userSession]);

  const setUserSession = useCallback((session: UserSession | null) => {
    setUserSessionState(session);

    if (typeof window !== "undefined") {
      if (session) {
        localStorage.setItem("circle_user_session", JSON.stringify(session));
      } else {
        localStorage.removeItem("circle_user_session");
      }
    }
  }, []);

  const executeChallenge = useCallback(
    (
      challengeId: string,
      callback?: (error: any, result?: ChallengeResult) => void
    ) => {
      if (!sdk) {
        console.error("SDK not initialized");
        callback?.(new Error("SDK not initialized"));
        return;
      }

      console.log("Executing challenge:", challengeId);

      sdk.execute(challengeId, (error: any, result?: any) => {
        if (error) {
          console.error("Challenge execution error:", {
            code: error?.code,
            message: error?.message,
            fullError: error,
          });
          callback?.(error);
          return;
        }

        console.log(`Challenge completed: ${result?.type} - ${result?.status}`);

        if (result?.data) {
          console.log("Challenge data:", result.data);
        }

        callback?.(null, result as ChallengeResult);
      });
    },
    [sdk]
  );

  const clearSession = useCallback(() => {
    setUserSession(null);
    console.log("Session cleared");
  }, [setUserSession]);

  const value: CircleContextType = {
    sdk,
    appId,
    isInitialized,
    userSession,
    setUserSession,
    executeChallenge,
    clearSession,
    deviceId,
    walletProvider: WALLET_PROVIDER,
  };

  return (
    <CircleContext.Provider value={value}>{children}</CircleContext.Provider>
  );
}
