import api from '../api';
import { Platform } from 'react-native';
import supabase from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_CONFIG } from '../config/upload';

console.log('🔧 API Base URL:', api.defaults.baseURL || 'Not set');
console.log('🔧 API Timeout:', api.defaults.timeout || 'Default');

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
 * Upload result interface
 */
export interface UploadResult {
    url?: string;
    id?: string;
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    error?: string;
}

/**
 * Fetches all videos for the authenticated user
 * @returns Promise with array of user videos
 */
export const getUserVideos = async (): Promise<UserVideo[]> => {
    console.log('🔧 API Call Info:', {
        baseURL: api.defaults.baseURL,
        method: 'GET',
        endpoint: '/api/videos'
    });
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
    console.log('🔧 API Call Info:', {
        baseURL: api.defaults.baseURL,
        method: 'GET',
        endpoint: `/api/videos/${videoId}`
    });
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
 * Helper function to upload a single chunk with retry logic
 * @param bucketName Storage bucket name
 * @param filePath Full path for the chunk file
 * @param chunkBlob Blob data for this chunk
 * @param maxAttempts Maximum number of retry attempts
 * @returns Promise that resolves when upload is successful
 */
const uploadChunkWithRetry = async (
    bucketName: string,
    filePath: string, 
    chunkBlob: Blob, 
    maxAttempts: number = 3
): Promise<void> => {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        try {
            const { error } = await supabase.storage
                .from(bucketName)
                .upload(filePath, chunkBlob, {
                    contentType: 'application/octet-stream',
                    upsert: true,
                });
                
            if (error) throw error;
            return; // Success, exit function
        } catch (error) {
            console.error(`❌ Error uploading chunk ${filePath}, attempt ${attempts + 1}:`, error);
            attempts++;
            
            if (attempts >= maxAttempts) {
                throw new Error(`Failed to upload chunk ${filePath} after ${maxAttempts} attempts`);
            }
            
            // Exponential backoff
            const delay = Math.pow(2, attempts) * 1000;
            console.log(`⏱️ Retrying chunk ${filePath} after ${delay}ms delay...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

/**
 * Uploads a video to the server (legacy method)
 * This method is kept for backward compatibility but uploadVideoDirectToSupabase is preferred
 * @param videoUri The URI of the video to upload
 * @param onProgress Optional callback for upload progress
 * @returns Promise with upload result
 */
export const uploadVideo = async (
    videoUri: string,
    onProgress?: (progress: number) => void
): Promise<UploadResult> => {
    console.log('⚠️ Using legacy upload method. Consider using uploadVideoDirectToSupabase instead.');
    try {
        // Use direct Supabase upload for all videos now
        return uploadVideoDirectToSupabase({ videoUri, onProgress });
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
        
        return { error: errorMessage, status: 'failed' };
    }
};

/**
 * Uploads a video directly to Supabase Storage and notifies the backend for processing
 * The backend processing happens asynchronously after this function returns
 * @param params Upload parameters object
 * @returns Promise with upload result
 */
export const uploadVideoDirectToSupabase = async (
    params: {
        videoUri: string;
        title?: string;
        location?: string;
        onProgress?: (progress: number) => void;
    }
): Promise<UploadResult> => {
    const { videoUri, title = 'Untitled Video', location, onProgress } = params;
    
    console.log('📣 uploadVideoDirectToSupabase called with params:', { 
        videoUri: videoUri ? `${videoUri.substring(0, 30)}...` : null, 
        title, 
        location 
    });
    
    try {
        // Check authentication status
        console.log('📣 Checking authentication status...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            console.error('❌ Authentication failed: No session token');
            throw new Error('Not authenticated');
        }
        console.log('✅ User authenticated');

        // Get the user ID
        console.log('📣 Getting user ID...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('❌ Authentication failed: No user found');
            throw new Error('User not found');
        }
        console.log(`✅ User ID obtained: ${user.id.substring(0, 8)}...`);

        // Get the video blob
        console.log('📣 Getting video blob...');
        let blob: Blob;
        try {
            if (Platform.OS === "web") {
                const response = await fetch(videoUri);
                blob = await response.blob();
            } else {
                // For mobile platforms, fetch the blob
                const response = await fetch(videoUri);
                blob = await response.blob();
            }
            console.log(`✅ Video blob obtained, size: ${(blob.size / (1024 * 1024)).toFixed(2)}MB, type: ${blob.type}`);
        } catch (blobError: any) {
            console.error('❌ Failed to get blob from videoUri:', blobError);
            throw new Error(`Failed to get video data: ${blobError.message}`);
        }

        // Calculate total size
        const totalSize = blob.size;
        console.log(`📊 Video size: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`);
        
        // Start progress
        onProgress?.(5);
        
        // Use chunked upload for all files regardless of size
        console.log('🧩 Using chunked upload approach for all files');
        
        // Set up chunk parameters - for small files this might just be 1 chunk
        const totalChunks = Math.max(1, Math.ceil(totalSize / UPLOAD_CONFIG.CHUNK_SIZE));
        
        // Initialize the upload with backend
        console.log('🚀 Initializing upload with backend...');
        console.log('🔧 API Call Info for initialization:', {
            baseURL: api.defaults.baseURL,
            method: 'POST',
            endpoint: '/api/videos/upload/initialize',
            data: {
                title,
                location,
                totalChunks,
                fileSize: totalSize,
                mimeType: blob.type || 'video/mp4'
            }
        });
        
        try {
            const initResponse = await api.post('/api/videos/upload/initialize', {
                title,
                location,
                totalChunks,
                fileSize: totalSize,
                mimeType: blob.type || 'video/mp4'
            });
            console.log('✅ Upload initialization successful, response:', initResponse.data);
            
            if (!initResponse.data.uploadId) {
                console.error('❌ Upload initialization failed: No upload ID in response');
                throw new Error('Failed to initialize upload: No upload ID received');
            }
            
            const uploadId = initResponse.data.uploadId;
            console.log(`✅ Upload initialized with ID: ${uploadId}`);
            
            let uploadedChunks = 0;
            
            console.log(`📊 Splitting file into ${totalChunks} chunks of ${UPLOAD_CONFIG.CHUNK_SIZE / 1024} KB each with ${UPLOAD_CONFIG.MAX_CONCURRENT_UPLOADS} parallel uploads`);
            
            // Process chunks in batches for controlled parallelism
            for (let i = 0; i < totalChunks; i += UPLOAD_CONFIG.MAX_CONCURRENT_UPLOADS) {
                const uploadPromises = [];
                const batchSize = Math.min(UPLOAD_CONFIG.MAX_CONCURRENT_UPLOADS, totalChunks - i);
                
                // Create a batch of promises for concurrent upload
                for (let j = 0; j < batchSize; j++) {
                    const chunkIndex = i + j;
                    const start = chunkIndex * UPLOAD_CONFIG.CHUNK_SIZE;
                    const end = Math.min(start + UPLOAD_CONFIG.CHUNK_SIZE, totalSize);
                    const chunkBlob = blob.slice(start, end);
                    const userId = user.id;
                    const chunkPath = `${userId}/${userId}_${uploadId}.part${chunkIndex}`;
                    
                    // Add more detailed logging about the chunk
                    console.log(`📦 Preparing chunk ${chunkIndex+1}/${totalChunks}:`, {
                        path: chunkPath,
                        size: chunkBlob.size,
                        start,
                        end
                    });
                    
                    // Add to batch of parallel uploads
                    uploadPromises.push(
                        uploadChunkWithRetry('videos', chunkPath, chunkBlob)
                            .then(() => {
                                // Update progress for each completed chunk
                                uploadedChunks++;
                                const progress = Math.min(Math.round((uploadedChunks / totalChunks) * 90) + 5, 95);
                                onProgress?.(progress);
                                console.log(`✅ Chunk ${chunkIndex+1}/${totalChunks} uploaded successfully (${((uploadedChunks/totalChunks)*100).toFixed(0)}%) to ${chunkPath}`);
                                
                                // Update the backend about chunk progress
                                // This is a fire-and-forget call - we don't wait for response
                                api.post('/api/videos/update-chunk-progress', {
                                    uploadId: uploadId,
                                    uploadedChunks: uploadedChunks
                                }).catch(error => {
                                    console.warn('⚠️ Failed to update chunk progress:', error);
                                });
                            })
                            .catch(error => {
                                console.error(`❌ Failed to upload chunk ${chunkIndex+1}/${totalChunks}:`, error);
                                throw error; // Re-throw to be caught by Promise.all
                            })
                    );
                }
                
                // Wait for current batch to complete before moving to next batch
                try {
                    await Promise.all(uploadPromises);
                    console.log(`✅ Batch ${i/UPLOAD_CONFIG.MAX_CONCURRENT_UPLOADS + 1} completed successfully`);
                } catch (batchError: any) {
                    console.error(`❌ Error in upload batch:`, batchError);
                    throw new Error(`Failed to upload batch: ${batchError.message}`);
                }
            }
            
            console.log(`✅ Successfully uploaded all ${totalChunks} chunks in parallel`);
            
            // Update progress to indicate completion of upload
            onProgress?.(100);
            
            // Return success - backend will automatically combine chunks when all are uploaded
            return { 
                url: `${supabase.storage.from('videos').getPublicUrl(`${user.id}/${user.id}_${uploadId}`).data.publicUrl}`,
                id: uploadId,
                status: 'processing'
            };
        } catch (initError: any) {
            console.error('❌ Upload initialization failed:', initError);
            console.error('Error details:', initError.response?.data || initError.message);
            throw new Error(`Failed to initialize upload: ${initError.message}`);
        }
    } catch (error: any) {
        console.error('❌ Error uploading video:', error);
        throw error;
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

/**
 * Check processing status of a video
 * @param videoId The ID of the video to check
 * @returns Promise with analysis status
 */
export const checkVideoProcessingStatus = async (videoId: string): Promise<{
    status: 'pending' | 'completed' | 'failed' | 'unknown';
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
                    status: 'completed',
                    hasInsights: true,
                    insightsCount: data.coachingMoments.length
                };
            } 
            
            // If analysis_status field exists, use it
            if (data.analysis_status) {
                return {
                    status: data.analysis_status === 'completed' ? 'completed' : 
                           data.analysis_status === 'failed' ? 'failed' : 'pending',
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
            console.log('🔄 Retrying metadata update...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            await api.patch(`/api/videos/${videoId}`, metadata);
            console.log('✅ Metadata update retry successful');
            return true;
        } catch (retryError) {
            console.error('❌ Metadata update retry failed:', retryError);
            return false;
        }
    }
}; 