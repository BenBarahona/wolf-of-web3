"use client";

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface UserPreferences {
  id: string;
  userId: string;
  investmentPreferences: string[];
  timeHorizon: string | null;
  riskPreference: string | null;
  selectedStrategy: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavePreferencesData {
  investmentPreferences?: string[];
  timeHorizon?: string;
  riskPreference?: string;
  selectedStrategy?: string;
}

export function usePreferences() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savePreferences = async (
    userToken: string,
    data: SavePreferencesData
  ): Promise<UserPreferences | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-token": userToken,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save preferences");
      }

      return result.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPreferences = async (
    userToken: string
  ): Promise<UserPreferences | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/preferences`, {
        method: "GET",
        headers: {
          "x-user-token": userToken,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to get preferences");
      }

      return result.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (
    userToken: string
  ): Promise<UserPreferences | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/preferences/complete-onboarding`,
        {
          method: "PUT",
          headers: {
            "x-user-token": userToken,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to complete onboarding");
      }

      return result.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    savePreferences,
    getPreferences,
    completeOnboarding,
  };
}

