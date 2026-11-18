import { useEffect, useState } from 'react';

import { type ConnectionStatus, subscribeToConnection } from '@/services/connectivity/network';

export function useConnectivity(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('unknown');
  useEffect(() => subscribeToConnection(setStatus), []);
  return status;
}
