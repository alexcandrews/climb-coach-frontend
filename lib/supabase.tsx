import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";

const SUPABASE_URL = Constants.expoConfig?.extra?.SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY?.trim();

const debugLog = (...args: unknown[]) => {
    if (__DEV__) {
        console.log(...args);
    }
};

debugLog("🔍 Supabase URL =", JSON.stringify(SUPABASE_URL));
debugLog("🔍 Supabase Key Status =", SUPABASE_ANON_KEY ? "Loaded ✅" : "Not Loaded ❌");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("❌ Supabase URL and API key are required.");
}

// Custom storage adapter for Supabase that uses platform-specific secure storage
const SupabaseStorage = {
    async getItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    },
    async setItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        await SecureStore.setItemAsync(key, value);
    },
    async removeItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        await SecureStore.deleteItemAsync(key);
    }
};

// Initialize Supabase client with custom storage adapter
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: SupabaseStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    },
    global: {
        headers: {
            'X-Client-Info': 'climbing-coach-frontend'
        }
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// 🚪 Logout user
export async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

// 🧑‍💼 Get user profile
export async function getUserProfile() {
    try {
        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('No authenticated user found when getting profile');
            return { error: 'Not authenticated' };
        }

        debugLog('Getting profile for user:', user.id);

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching profile:', error);
            return { error };
        }

        // If no profile exists, create a default one
        if (!data) {
            debugLog('Creating default profile for user:', user.id);

            const defaultProfile = {
                id: user.id,
                name: user.email ? user.email.split('@')[0] : 'Climber',
                years_climbing: 0,
                primary_goals: 'Improve technique',
                skill_level: 'Beginner',
                climbing_styles: ['Indoor Bouldering'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Try insert for new profiles
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert(defaultProfile)
                .select();

            if (createError) {
                console.error('Error creating default profile:', createError);
                return { error: createError };
            }

            if (!newProfile || newProfile.length === 0) {
                console.error('No data returned after creating default profile');
                return { error: 'Failed to create default profile' };
            }

            debugLog('Default profile created:', newProfile[0]);
            return { data: newProfile[0] };
        }

        debugLog('Profile retrieved:', data);
        return { data };
    } catch (error) {
        console.error('Unexpected error getting profile:', error);
        return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}

// 📝 Update user profile
export async function updateUserProfile(profileData: {
    name?: string;
    years_climbing?: number;
    primary_goals?: string;
    skill_level?: string;
    climbing_styles?: string[];
}) {
    try {
        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('No authenticated user found');
            return { error: 'Not authenticated' };
        }

        debugLog('Updating profile for user:', user.id, 'with data:', profileData);

        // Use update instead of upsert
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...profileData,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select();

        if (error) {
            console.error('Error updating profile:', error);
            return { error };
        }

        if (!data || data.length === 0) {
            console.error('No data returned from profile update');

            // Try to get the profile first to see if it exists
            const { data: existingProfile, error: getError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (getError || !existingProfile) {
                debugLog('Profile doesn\'t exist yet. Creating new profile...');

                // Create a new profile with insert
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        name: profileData.name || (user.email ? user.email.split('@')[0] : 'Climber'),
                        years_climbing: profileData.years_climbing || 0,
                        primary_goals: profileData.primary_goals || 'Improve technique',
                        skill_level: profileData.skill_level || 'Beginner',
                        climbing_styles: profileData.climbing_styles || ['Indoor Bouldering'],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select();

                if (insertError) {
                    console.error('Error creating new profile:', insertError);
                    return { error: insertError };
                }

                if (!newProfile || newProfile.length === 0) {
                    return { error: 'Failed to create new profile' };
                }

                debugLog('Created new profile:', newProfile[0]);
                return { data: newProfile[0] };
            }

            return { error: 'Failed to update profile - no data returned' };
        }

        debugLog('Profile updated successfully:', data[0]);
        return { data: data[0] };
    } catch (error) {
        console.error('Unexpected error updating profile:', error);
        return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}

// 🐞 Debug profile update
export async function debugProfileUpdate() {
    try {
        // 1. Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('No authenticated user found');
            return { status: 'error', message: 'Not authenticated' };
        }

        debugLog('Debug: User authenticated:', { id: user.id, email: user.email });

        // 2. Try to get profile
        const { data: getProfile, error: getError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        debugLog('GET Profile result:', { data: getProfile, error: getError });

        // 3. Test with PATCH approach (update + eq)
        const testData = {
            name: 'Test Update via PATCH ' + new Date().toISOString().substring(0, 19)
        };

        debugLog('Attempting PATCH update with:', testData);

        const { data: updateResult, error: updateError } = await supabase
            .from('profiles')
            .update(testData)
            .eq('id', user.id)
            .select();

        debugLog('UPDATE Profile result (PATCH):', { data: updateResult, error: updateError });

        // 4. Try upsert as a fallback (this might fail due to RLS)
        debugLog('Attempting upsert with:', { ...testData, id: user.id, name: 'Test Update via UPSERT' });

        const { data: upsertResult, error: upsertError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                name: 'Test Update via UPSERT ' + new Date().toISOString().substring(0, 19),
                updated_at: new Date().toISOString()
            })
            .select();

        debugLog('UPDATE Profile result (UPSERT):', { data: upsertResult, error: upsertError });

        return {
            status: 'complete',
            user: { id: user.id, email: user.email },
            getProfile: { data: getProfile, error: getError },
            updatePatch: { data: updateResult, error: updateError },
            updateUpsert: { data: upsertResult, error: upsertError }
        };
    } catch (error) {
        console.error('Error in debug function:', error);
        return { status: 'error', message: error instanceof Error ? error.message : String(error) };
    }
}

export default supabase;
