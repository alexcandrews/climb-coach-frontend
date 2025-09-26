import Constants from 'expo-constants';

type ExtraConfig = {
    API_URL?: string;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

const sanitize = (value?: string) =>
    typeof value === 'string' ? value.trim().replace(/['";]+/g, '') : undefined;

const API_URL =
    sanitize(extra.API_URL) ||
    (typeof process.env.EXPO_PUBLIC_API_URL === 'string'
        ? process.env.EXPO_PUBLIC_API_URL.trim()
        : undefined) ||
    'http://localhost:8080';

export const APP_CONFIG = {
    apiUrl: API_URL,
    supabaseUrl: sanitize(extra.SUPABASE_URL),
    supabaseAnonKey: sanitize(extra.SUPABASE_ANON_KEY),
} as const;

// Development flags
export const DEV_FLAGS = {
    ENABLE_SEED_DATA: __DEV__,
    SHOW_DEBUG_UI: __DEV__,
} as const;

export const DEV_MODE = __DEV__;

// API configuration
export const API_CONFIG = {
    BASE_URL: APP_CONFIG.apiUrl,
} as const;
