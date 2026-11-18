import { LargeSecureStore } from './secureStorage';

/** Native session storage: encrypted (Keychain / Keystore key + AsyncStorage). */
export const sessionStorage = new LargeSecureStore();
