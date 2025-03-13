import "dotenv/config";

module.exports = {
  expo: {
    name: "Climb Coach",
    slug: "climbing-coach-frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.alexcandrews.climbingcoachfrontend"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.alexcandrews.climbingcoachfrontend"
    },
    web: {
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      tsconfigPaths: true,
      typedRoutes: true
    },
    runtimeVersion: "1.0.0",
    updates: {
      url: "https://u.expo.dev/05d15da2-f0a7-4542-b0db-b04d41d04281"
    },
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: "05d15da2-f0a7-4542-b0db-b04d41d04281"
      }
    }
  },
};