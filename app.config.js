import "dotenv/config";

export default {
  expo: {
    name: "climbing-coach",
    slug: "climbing-coach",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL?.replace(/['";]+/g, "") || "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY?.replace(/['";]+/g, "") || "",
    },
  },
};