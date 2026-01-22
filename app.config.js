import 'dotenv/config';

export default {
  expo: {
    name: 'bookmark-map-app',
    slug: 'bookmark-map-app',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.bookmarkmap.app',
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS || 'YOUR_IOS_GOOGLE_MAPS_API_KEY',
      },
    },
    android: {
      package: 'com.bookmarkmap.app',
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID || 'YOUR_ANDROID_GOOGLE_MAPS_API_KEY',
        },
      },
    },
    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow $(PRODUCT_NAME) to use your location to find nearby bookmarks.',
        },
      ],
    ],
    extra: {
      // Firebase設定を環境変数から読み込む
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
  },
};
