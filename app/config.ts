// Development flags
export const DEV_FLAGS = {
    ENABLE_SEED_DATA: true,  // Set to true to enable seed data by default
    SHOW_DEBUG_UI: __DEV__,   // Show debug UI elements (like the seed data toggle)
} as const;

// Development configuration
export const DEV_MODE = false;

// API configuration
export const API_CONFIG = {
    BASE_URL: DEV_MODE ? "http://localhost:8000" : "https://climb-coach-backend-production.up.railway.app",
} as const; 