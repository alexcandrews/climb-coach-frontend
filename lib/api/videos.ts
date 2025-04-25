import api from '../api';
import { Platform } from 'react-native';
import supabase from '../supabase';

export interface UserVideo {
    id: string;
    name: string;
    createdAt: string;
    size: number;
    contentType: string;
    url: string;
}

export interface VideoDetails {
    id: string;
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    location: string;
    createdAt: string;
    insights: CoachingInsight[];
}

export interface CoachingInsight {
    timestamp: number;
    coaching: string;
    type: string;
    confidence: number;
}

/**
 * Fetches all videos for the authenticated user
 * @returns Promise with array of user videos
 */
export const getUserVideos = async (): Promise<UserVideo[]> => {
    try {
        const response = await api.get('/api/videos');
        if (response.status === 200 && response.data.videos) {
            console.log(`Loaded ${response.data.videos.length} videos`);
            return response.data.videos;
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch videos:', error);
        return [];
    }
};

/**
 * Fetches a specific video by ID
 * @param videoId The ID of the video to fetch
 * @returns Promise with video details
 */
export const getVideo = async (videoId: string): Promise<VideoDetails | null> => {
    try {
        const response = await api.get(`/api/videos/${videoId}`);
        if (response.status === 200 && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch video:', error);
        return null;
    }
};

/**
 * Creates a FormData object from a video URI
 * @param videoUri The URI of the video to upload
 * @returns FormData object with the video appended
 */
export const createVideoFormData = async (videoUri: string): Promise<FormData> => {
    const formData = new FormData();

    if (Platform.OS === "web") {
        // Special handling for web
        const response = await fetch(videoUri);
        const blob = await response.blob();
        formData.append("video", new File([blob], "upload.mp4", { type: "video/mp4" }));
    } else {
        // Mobile (iOS/Android)
        formData.append("video", {
            uri: videoUri,
            name: "upload.mp4",
            type: "video/mp4",
        } as any);
    }

    return formData;
};

/**
 * Uploads a video to the server
 * @param videoUri The URI of the video to upload
 * @returns Promise with upload result
 */
export const uploadVideo = async (videoUri: string): Promise<{ url?: string; error?: string }> => {
    try {
        // Check authentication status
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated');
        }

        const formData = await createVideoFormData(videoUri);
        
        const response = await api.post('/api/videos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 60000 // 60 second timeout for large uploads
        });

        if (response.status === 200 && response.data.url) {
            return { url: response.data.url };
        } else {
            return { 
                error: response.data?.error || response.data?.message || 'Upload failed'
            };
        }
    } catch (error: any) {
        console.error("Upload Error:", error);
        let errorMessage = "Error uploading video";
        
        if (error.response) {
            // Server responded with error
            const data = error.response.data;
            errorMessage = data?.error || data?.details || data?.message || 
                `Server error: ${error.response.status}`;
        } else if (error.request) {
            // Request made but no response
            errorMessage = "No response from server. Check your internet connection.";
        } else {
            // Error in request setup
            errorMessage = error.message || "Failed to make request";
        }
        
        return { error: errorMessage };
    }
};

/**
 * Parses coaching moments from the API response
 * @param data Raw coaching data from API
 * @returns Array of parsed coaching insights
 */
export const parseCoachingMoments = (data: any): CoachingInsight[] => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => ({
        timestamp: item.timestamp || 0,
        coaching: item.feedback || "",
        type: item.type || "form",
        confidence: item.confidence || 0.5
    }));
}; 