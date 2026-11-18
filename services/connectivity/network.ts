import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

export type ConnectionStatus = 'online' | 'offline' | 'unknown';

export function toConnectionStatus(state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>): ConnectionStatus {
  if (state.isConnected === false || state.isInternetReachable === false) return 'offline';
  if (state.isConnected === true) return 'online';
  return 'unknown';
}

/** One-off connectivity check before a network action (never throws). */
export async function getConnectionStatus(): Promise<ConnectionStatus> {
  try {
    return toConnectionStatus(await NetInfo.fetch());
  } catch {
    return 'unknown';
  }
}

export function subscribeToConnection(listener: (status: ConnectionStatus) => void): () => void {
  return NetInfo.addEventListener((state) => listener(toConnectionStatus(state)));
}
