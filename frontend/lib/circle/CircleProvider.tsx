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
}

const CircleContext = createContext<CircleContextType>({
  sdk: null,
  appId: null,
  isInitialized: false,
  userSession: null,
  setUserSession: () => {},
  executeChallenge: () => {},
  clearSession: () => {},
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
  const [userSession, setUserSessionState] = useState<UserSession | null>(
    () => {
      // Try to load session from localStorage on mount
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
        const config = await getCircleConfig();
        setAppId(config.appId);

        const sdkInstance = new W3SSdk({
          appSettings: {
            appId: config.appId,
          },
        });

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
          console.error(
            `Challenge error ${error?.code || "Unknown"}: ${
              error?.message || "Error!"
            }`
          );
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
  };

  return (
    <CircleContext.Provider value={value}>{children}</CircleContext.Provider>
  );
}
