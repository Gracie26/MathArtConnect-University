import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Central application identity.
 *
 * Every store-facing identifier lives here so it can be changed in one place
 * before Google Play / App Store submission. Each value can also be overridden
 * per build through environment variables (e.g. in an EAS build profile)
 * without editing source.
 */
const IDENTITY = {
  name: 'MathArt Connect',
  slug: 'mathart-connect',
  scheme: 'mathartconnect',
  version: '0.1.0',
  iosBundleIdentifier: process.env.APP_IOS_BUNDLE_ID ?? 'com.mathartconnect.mobile',
  androidPackage: process.env.APP_ANDROID_PACKAGE ?? 'com.mathartconnect.mobile',
  easOwner: 'mbuku',
  easProjectId: '80bcfd0e-c7ac-4ca2-8e06-002cd772a7ee',
} as const;

const BRAND = {
  sand: '#F7F4EF',
  charcoal: '#18212B',
} as const;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IDENTITY.name,
  slug: IDENTITY.slug,
  scheme: IDENTITY.scheme,
  version: IDENTITY.version,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: BRAND.sand,
  runtimeVersion: { policy: 'appVersion' },
  ios: {
    bundleIdentifier: IDENTITY.iosBundleIdentifier,
    supportsTablet: true,
    // Sign in with Apple capability (EAS syncs it to the Apple Developer App ID).
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: IDENTITY.androidPackage,
    adaptiveIcon: {
      backgroundColor: BRAND.sand,
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    'expo-web-browser',
    'expo-apple-authentication',
    [
      'expo-image-picker',
      {
        photosPermission: 'MathArt Connect uses a photo you choose as your optional profile picture.',
        cameraPermission: false,
        microphonePermission: false,
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: BRAND.sand,
        dark: {
          image: './assets/splash-icon.png',
          backgroundColor: BRAND.charcoal,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  // The EAS project (@mbuku/mathart-connect) used for EAS Hosting and builds; EAS_PROJECT_ID overrides it.
  owner: IDENTITY.easOwner,
  extra: {
    eas: { projectId: process.env.EAS_PROJECT_ID ?? IDENTITY.easProjectId },
  },
});
