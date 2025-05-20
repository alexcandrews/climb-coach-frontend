import "dotenv/config";

export default {
  expo: {
    name: "climbing-coach",
    slug: "climbing-coach",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      url: "https://u.expo.dev/a729388d-8cef-4799-98cd-32b49fc25651"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.alexcandrews.climbingcoach"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.alexcandrews.climbingcoach"
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/['";]+/g, "") || "",
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.replace(/['";]+/g, "") || "",
      eas: {
        projectId: "a729388d-8cef-4799-98cd-32b49fc25651"
      }
    },
    runtimeVersion: {
      policy: "appVersion"
    }
  },
};