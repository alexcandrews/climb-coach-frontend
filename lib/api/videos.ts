import api from '../api';
import supabase from '../supabase';
import * as FileSystem from 'expo-file-system';
import { Upload } from 'tus-js-client';
import { Platform } from 'react-native';
import { UPLOAD_CONFIG } from '../config/upload';

const debugLog = (...args: unknown[]) => {
    if (__DEV__) {
        console.log(...args);
    }
};

debugLog('🔧 API Base URL:', api.defaults.baseURL || 'Not set');
debugLog('🔧 API Timeout:', api.defaults.timeout || 'Default');

const EXTENSION_TO_MIME: Record<string, string> = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    qt: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
    mpg: 'video/mpeg',
    mpeg: 'video/mpeg'
};

const inferMimeTypeFromUri = (uri?: string, fallback: string = 'video/mp4'): string => {
    if (!uri) return fallback;
    const lowerUri = uri.toLowerCase();
    const queryless = lowerUri.split('?')[0];
    const parts = queryless.split('.');
    const extension = parts.length > 1 ? parts.pop() ?? '' : '';
    if (extension && EXTENSION_TO_MIME[extension]) {
        return EXTENSION_TO_MIME[extension];
    }
    return fallback;
};

const inferOriginalFilename = (uri?: string): string | undefined => {
    if (!uri) return undefined;
    const sanitized = uri.split('?')[0];
    const segments = sanitized.split('/');
    const last = segments.pop();
    if (!last) return undefined;
    if (last.startsWith('cache-') || last.includes('expo-file-system')) {
        return undefined;
    }
    return last;
};

const fallbackFileName = () => `upload-${Date.now()}.mp4`;

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
    analysis_status: 'uploading' | 'pending_processing' | 'processing' | 'analyzing' | 'not started' | 'in progress' | 'complete' | 'error';
}

export interface CoachingInsight {
    timestamp: number;
    coaching: string;
    type: string;
    confidence: number;
}

/**
 * Upload result interface
 */
export interface UploadResult {
    url?: string;
    id?: string;
    status: 'uploading' | 'pending_processing' | 'processing' | 'complete' | 'error';
    error?: string;
}

/**
 * Fetches all videos for the authenticated user
 * @returns Promise with array of user videos
 */
export const getUserVideos = async (): Promise<UserVideo[]> => {
    debugLog('🔧 API Call Info:', {
        baseURL: api.defaults.baseURL,
        method: 'GET',
        endpoint: '/api/videos'
    });
    try {
        const response = await api.get('/api/videos');
        if (response.status === 200 && response.data.videos) {
            debugLog(`Loaded ${response.data.videos.length} videos`);
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
    debugLog('🔧 API Call Info:', {
        baseURL: api.defaults.baseURL,
        method: 'GET',
        endpoint: `/api/videos/${videoId}`
    });
    try {
        const response = await api.get(`/api/videos/${videoId}`);
        if (response.status === 200 && response.data) {
            // Ensure analysis_status is present
            if (!('analysis_status' in response.data)) {
                response.data.analysis_status = 'uploading';
            }
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch video:', error);
        return null;
    }
};

/**
 * Upload a video by delegating to the direct Supabase Storage flow.
 * @param videoUri Local URI of the video to upload
 * @param onProgress Optional progress callback (0-100)
 */
export const uploadVideo = async (
    videoUri: string,
    onProgress?: (progress: number) => void
): Promise<UploadResult> => {
    try {
        return await uploadVideoDirectToSupabase({ videoUri, onProgress });
    } catch (error: any) {
        console.error('Upload Error:', error);
        let errorMessage = 'Error uploading video';

        if (error?.response) {
            const data = error.response.data;
            errorMessage = data?.error || data?.details || data?.message ||
                `Server error: ${error.response.status}`;
        } else if (error?.request) {
            errorMessage = 'No response from server. Check your internet connection.';
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return { error: errorMessage, status: 'error' } as UploadResult;
    }
};

interface DirectUploadParams {
    videoUri: string;
    title?: string;
    location?: string;
    onProgress?: (progress: number) => void;
}

const toTusMetadata = (metadata: Record<string, string | number | undefined>): Record<string, string> => {
    return Object.entries(metadata).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value === undefined || value === null) {
            return acc;
        }
        acc[key] = String(value);
        return acc;
    }, {});
};

/**
 * Uploads a video directly to Supabase Storage and notifies the backend for processing.
 */
export const uploadVideoDirectToSupabase = async (
    params: DirectUploadParams
): Promise<UploadResult> => {
    const { videoUri, title = 'Untitled Video', location, onProgress } = params;

    if (!videoUri) {
        throw new Error('No video selected');
    }

    let mimeType = inferMimeTypeFromUri(videoUri);
    let originalName = inferOriginalFilename(videoUri) || fallbackFileName();
    let fileSize = 0;
    let tusUploadData: any;
    let cachedBlob: Blob | null = null;

    if (Platform.OS === 'web') {
        const response = await fetch(videoUri);
        const blob = await response.blob();
        cachedBlob = blob;
        fileSize = blob.size;
        mimeType = blob.type || mimeType;
        if (!originalName) {
            originalName = fallbackFileName();
        }
        tusUploadData = new File([blob], originalName, { type: mimeType });
    } else {
        const fileInfo = await FileSystem.getInfoAsync(videoUri, { size: true });
        if (!fileInfo.exists) {
            throw new Error('Video file not found at provided URI');
        }

        fileSize = fileInfo.size ?? 0;
        if (!fileSize) {
            throw new Error('Video file appears to be empty');
        }

        tusUploadData = {
            uri: videoUri,
            name: originalName,
            type: mimeType,
            size: fileSize
        };
    }

    if (!fileSize) {
        throw new Error('Video file appears to be empty');
    }

    onProgress?.(5);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('Not authenticated');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not found');
    }

    const shouldUseTus = fileSize >= UPLOAD_CONFIG.RESUMABLE_UPLOAD_THRESHOLD;

    const initResponse = await api.post('/api/videos/upload/initialize', {
        title,
        location,
        fileSize,
        mimeType,
        originalName
    });

    const initData = initResponse.data || {};
    if (!initData.videoId || !initData.objectName) {
        throw new Error('Failed to initialise upload: missing upload metadata');
    }

    const targetBucket = initData.bucket || initData.metadata?.bucketName || 'videos-complete';
    const objectName: string = initData.objectName;
    const publicUrl: string | undefined = initData.publicUrl;
    const uploadUrl: string = initData.uploadUrl;
    const chunkSize: number = initData.chunkSize || UPLOAD_CONFIG.RESUMABLE_CHUNK_SIZE;
    const uploadMetadata = toTusMetadata({
        bucketName: targetBucket,
        objectName,
        contentType: mimeType,
        cacheControl: initData.metadata?.cacheControl || UPLOAD_CONFIG.DEFAULT_CACHE_CONTROL,
        videoId: initData.videoId,
        filename: originalName
    });

    const useTus = initData.useTus ?? shouldUseTus;

    if (useTus) {
        await new Promise<void>((resolve, reject) => {
            const upload = new Upload(
                tusUploadData,
                {
                    endpoint: uploadUrl,
                    chunkSize,
                    metadata: uploadMetadata,
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        'x-upsert': 'false'
                    },
                    uploadDataDuringCreation: true,
                    retryDelays: [0, 3000, 10000, 30000, 60000],
                    onError: (err) => reject(err),
                    onProgress: (bytesUploaded, bytesTotal) => {
                        if (bytesTotal > 0) {
                            const progress = Math.round((bytesUploaded / bytesTotal) * 90) + 5;
                            onProgress?.(Math.min(95, Math.max(5, progress)));
                        }
                    },
                    onSuccess: () => resolve()
                }
            );

            upload.start();
        });
    } else {
        const blob = cachedBlob || (await (await fetch(videoUri)).blob());

        const { error: uploadError } = await supabase.storage
            .from(targetBucket)
            .upload(objectName, blob, {
                cacheControl: uploadMetadata.cacheControl,
                contentType: mimeType,
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        onProgress?.(95);
    }

    const markResponse = await api.post(`/api/videos/${initData.videoId}/mark-uploaded`, {
        fileSize,
        mimeType
    });

    const nextStatus = (markResponse.data?.status as UploadResult['status'] | undefined) || 'processing';

    onProgress?.(100);

    return {
        url: publicUrl,
        id: initData.videoId,
        status: nextStatus
    };
};

const parseCoachingMoments = (data: any): CoachingInsight[] => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => ({
        timestamp: item.timestamp || 0,
        coaching: item.feedback || "",
        type: item.type || "form",
        confidence: item.confidence || 0.5
    }));
};

/**
 * Check processing status of a video
 * @param videoId The ID of the video to check
 * @returns Promise with analysis status
 */
export const checkVideoProcessingStatus = async (videoId: string): Promise<{
    status: 'pending' | 'complete' | 'error' | 'unknown';
    hasInsights: boolean;
    insightsCount: number;
}> => {
    try {
        const response = await api.get(`/api/videos/${videoId}/insights`);
        
        if (response.status === 200) {
            const data = response.data;
            
            // Check if there are coaching moments
            if (data.coachingMoments && data.coachingMoments.length > 0) {
                return {
                    status: 'complete',
                    hasInsights: true,
                    insightsCount: data.coachingMoments.length
                };
            } 
            
            // If analysis_status field exists, use it
            if (data.analysis_status) {
                return {
                    status: data.analysis_status === 'complete' ? 'complete' : 
                           data.analysis_status === 'error' ? 'error' : 'pending',
                    hasInsights: false,
                    insightsCount: 0
                };
            }
            
            // Default for videos with no insights yet
            return {
                status: 'pending',
                hasInsights: false,
                insightsCount: 0
            };
        }
        
        return {
            status: 'unknown',
            hasInsights: false,
            insightsCount: 0
        };
    } catch (error) {
        console.error('Error checking video processing status:', error);
        return {
            status: 'unknown',
            hasInsights: false,
            insightsCount: 0
        };
    }
};

/**
 * Updates video metadata such as title and location
 * @param videoId ID of the video to update
 * @param metadata Object containing metadata fields to update
 * @returns Promise that resolves when update is complete
 */
export const updateVideoMetadata = async (
    videoId: string, 
    metadata: { title?: string; location?: string; description?: string }
): Promise<boolean> => {
    try {
        const cleanMetadata = {
            ...(metadata.title !== undefined && { title: metadata.title.trim() }),
            ...(metadata.location !== undefined && { location: metadata.location.trim() || null }),
            ...(metadata.description !== undefined && { description: metadata.description.trim() || null })
        };
        
        // Attempt to update metadata
        await api.patch(`/api/videos/${videoId}`, cleanMetadata);
        return true;
    } catch (error) {
        console.error('Failed to update video metadata:', error);
        
        // Implement retry logic
        try {
            debugLog('🔄 Retrying metadata update...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            await api.patch(`/api/videos/${videoId}`, metadata);
            debugLog('✅ Metadata update retry successful');
            return true;
        } catch (retryError) {
            console.error('❌ Metadata update retry failed:', retryError);
            return false;
        }
    }
}; 
