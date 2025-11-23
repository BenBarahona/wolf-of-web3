"use client";

import { useState, useCallback } from 'react';
import { useCircle } from './CircleProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Activity {
  id: string;
  userId: string;
  actionType: string;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export function useActivities() {
  const { userSession } = useCircle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActivities = useCallback(
    async (limit: number = 50): Promise<Activity[]> => {
      if (!userSession) {
        throw new Error('No user session available');
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/users/activities?limit=${limit}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Token': userSession.userToken,
            },
          }
        );

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to get activities');
        }

        return result.data || [];
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to get activities';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userSession]
  );

  return { getActivities, loading, error };
}

