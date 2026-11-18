import * as Crypto from 'expo-crypto';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fallbackUuid(): string {
  const hex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16));
  hex[12] = '4';
  hex[16] = ((parseInt(hex[16] ?? '0', 16) & 0x3) | 0x8).toString(16);
  const s = hex.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

/** A random UUID v4 for client-generated record ids (retries stay idempotent). */
export function newId(): string {
  try {
    const id: unknown = Crypto.randomUUID();
    // Where the native module is unavailable or mocked (e.g. tests), use the fallback.
    if (typeof id === 'string' && UUID.test(id)) return id;
  } catch {
    // Native module missing: fall through.
  }
  return fallbackUuid();
}
