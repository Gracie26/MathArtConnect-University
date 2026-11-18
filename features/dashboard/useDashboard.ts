import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { dashboardRepository } from '@/services/repositories/dashboardRepository';
import type { ServiceError } from '@/services/types';
import type { DashboardData } from '@/types/dashboard';

export type DashboardState =
  { status: 'loading' } | { status: 'ready'; data: DashboardData } | { status: 'error'; error: ServiceError };

/** Home data for the signed-in learner; refreshed whenever Home regains focus. */
export function useDashboard(): DashboardState & { reload: () => void } {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>({ status: 'loading' });
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    if (!user) return;
    const request = ++latestRequest.current;
    const result = await dashboardRepository.getDashboard(user.id);
    if (request !== latestRequest.current) return;
    setState(result.ok ? { status: 'ready', data: result.data } : { status: 'error', error: result.error });
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    void load();
  }, [load]);

  return { ...state, reload };
}
