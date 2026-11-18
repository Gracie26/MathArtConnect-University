import { Platform } from 'react-native';

/**
 * The native Animated driver does not exist on web; requesting it there logs
 * a warning on every animation, so only use it on iOS and Android.
 */
export const useNativeDriver = Platform.OS !== 'web';
