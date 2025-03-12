import 'react-native-url-polyfill/auto';
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { Session } from "@supabase/supabase-js";

const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 Final Check: SUPABASE_URL =", JSON.stringify(SUPABASE_URL));
console.log("�� Final Check: SUPABASE_ANON_KEY =", SUPABASE_ANON_KEY ? "Loaded ✅" : "Not Loaded ❌");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("❌ Supabase URL and API key are required.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Platform-specific storage implementation
const storage = {
    async setItem(key: string, value: string) {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        await SecureStore.setItemAsync(key, value);
    },
    async getItem(key: string) {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    },
    async removeItem(key: string) {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        await SecureStore.deleteItemAsync(key);
    }
};

// 🔐 Save session securely
export async function saveSession(session: Session | null) {
    if (!session?.access_token) {
        console.warn("No access token found in session");
        return;
    }
    await storage.setItem("userToken", session.access_token);
}

// 🔑 Get session from storage
export async function getSession() {
    return await storage.getItem("userToken");
}

// 🚪 Logout user
export async function logoutUser() {
    await storage.removeItem("userToken");
    await supabase.auth.signOut();
}

export default supabase;