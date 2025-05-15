import api from '../api';
import { Platform } from 'react-native';
import supabase from '../supabase';
import { v4 as uuidv4 } from 'uuid';

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
    url?: string;       // URL of the uploaded video
    id?: string;        // ID of the video in the database
    error?: string;     // Error message if upload failed
    status: 'completed' | 'processing' | 'failed'; // Overall status of the upload/processing
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
 * File size thresholds for chunked upload in bytes
 */
const CHUNKED_UPLOAD_THRESHOLD = 5 * 1024 * 1024; // 5MB
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks (larger for better performance)
const MAX_CONCURRENT_UPLOADS = 4; // Number of parallel uploads

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
        return uploadVideoDirectToSupabase(videoUri, onProgress);
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
 * @param videoUri The URI of the video to upload
 * @param onProgress Optional callback for upload progress
 * @returns Promise with upload result
 */
export const uploadVideoDirectToSupabase = async (
    videoUri: string,
    onProgress?: (progress: number) => void
): Promise<UploadResult> => {
    try {
        // Check authentication status
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Not authenticated');
        }

        // Get the user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not found');
        }

        // Get the video blob
        let blob: Blob;
        if (Platform.OS === "web") {
            const response = await fetch(videoUri);
            blob = await response.blob();
        } else {
            // For mobile platforms, fetch the blob
            const response = await fetch(videoUri);
            blob = await response.blob();
        }

        // Calculate total size
        const totalSize = blob.size;
        console.log(`📊 Video size: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`);
        
        // Generate unique ID for the video
        const fileId = uuidv4();
        const fileName = `${user.id}/${fileId}.mp4`;
        
        // Start progress
        onProgress?.(5);
        
        // File is larger than threshold, use chunked upload directly to Supabase
        if (totalSize > CHUNKED_UPLOAD_THRESHOLD) {
            console.log('🧩 Using parallel chunked upload directly to Supabase Storage');
            
            // Set up chunk parameters
            const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
            let uploadedChunks = 0;
            
            console.log(`📊 Splitting file into ${totalChunks} chunks of ${CHUNK_SIZE / 1024} KB each with ${MAX_CONCURRENT_UPLOADS} parallel uploads`);
            
            // Process chunks in batches for controlled parallelism
            for (let i = 0; i < totalChunks; i += MAX_CONCURRENT_UPLOADS) {
                const uploadPromises = [];
                const batchSize = Math.min(MAX_CONCURRENT_UPLOADS, totalChunks - i);
                
                // Create a batch of promises for concurrent upload
                for (let j = 0; j < batchSize; j++) {
                    const chunkIndex = i + j;
                    const start = chunkIndex * CHUNK_SIZE;
                    const end = Math.min(start + CHUNK_SIZE, totalSize);
                    const chunkBlob = blob.slice(start, end);
                    const chunkPath = `${fileName}.part${chunkIndex}`;
                    
                    // Add to batch of parallel uploads
                    uploadPromises.push(
                        uploadChunkWithRetry('videos', chunkPath, chunkBlob)
                            .then(() => {
                                // Update progress for each completed chunk
                                uploadedChunks++;
                                const progress = Math.min(Math.round((uploadedChunks / totalChunks) * 90) + 5, 95);
                                onProgress?.(progress);
                                console.log(`✅ Chunk ${chunkIndex+1}/${totalChunks} uploaded successfully (${((uploadedChunks/totalChunks)*100).toFixed(0)}%)`);
                            })
                    );
                }
                
                // Wait for current batch to complete before moving to next batch
                await Promise.all(uploadPromises);
            }
            
            console.log(`✅ Successfully uploaded all ${totalChunks} chunks in parallel`);
            
            // Update progress to indicate completion of upload
            onProgress?.(100);
            
            // Notify the backend to combine chunks async - don't wait for response
            // Add retry logic with exponential backoff
            const notifyBackendWithRetry = (attempt = 1, maxAttempts = 5, initialDelay = 2000) => {
                api.post('/api/videos/combine-chunks', {
                    videoId: fileId,
                    userId: user.id,
                    fileName: fileName,
                    totalChunks: totalChunks,
                    contentType: 'video/mp4',
                    size: totalSize,
                }).then(response => {
                    console.log('✅ Backend notified to process chunks', response.data);
                }).catch(error => {
                    console.error(`❌ Error notifying backend to process chunks (attempt ${attempt}/${maxAttempts}):`, error);
                    
                    if (attempt < maxAttempts) {
                        // Use exponential backoff with jitter
                        const delay = initialDelay * Math.pow(2, attempt - 1) * (0.75 + Math.random() * 0.5);
                        console.log(`⏱️ Retrying backend notification in ${Math.round(delay/1000)}s...`);
                        
                        setTimeout(() => {
                            notifyBackendWithRetry(attempt + 1, maxAttempts, initialDelay);
                        }, delay);
                    } else {
                        console.error('❌ Failed to notify backend after multiple attempts. User should check history later.');
                    }
                });
            };
            
            // Start the retry process
            notifyBackendWithRetry();
            
            // Get public URL base that will be used after processing
            const { data: publicUrl } = supabase.storage
                .from('videos')
                .getPublicUrl(fileName);
                
            // Return success immediately - don't wait for processing
            return { 
                url: publicUrl?.publicUrl,
                id: fileId,
                status: 'processing'
            };
        } else {
            // For smaller files, use single upload
            console.log('📤 Using single upload directly to Supabase Storage');
            const { data, error } = await supabase.storage
                .from('videos')
                .upload(fileName, blob, {
                    contentType: 'video/mp4',
                    upsert: true,
                });
                
            if (error) throw error;
            
            // Update progress
            onProgress?.(100);
            
            // Get public URL for the uploaded file
            const { data: publicUrl } = supabase.storage
                .from('videos')
                .getPublicUrl(fileName);
                
            if (!publicUrl?.publicUrl) {
                throw new Error('Failed to get public URL for uploaded video');
            }
            
            // Now notify the backend about the uploaded video to trigger AI analysis
            // Don't wait for response - do it asynchronously
            const notifyBackendWithRetry = (attempt = 1, maxAttempts = 5, initialDelay = 2000) => {
                api.post('/api/videos/process-external-upload', {
                    videoUrl: publicUrl.publicUrl,
                    videoId: fileId,
                    fileName: `upload.mp4`,
                    contentType: 'video/mp4',
                    size: totalSize,
                }).then(response => {
                    console.log('✅ Backend notified about uploaded video for processing', response.data);
                }).catch(error => {
                    console.error(`❌ Error notifying backend about upload (attempt ${attempt}/${maxAttempts}):`, error);
                    
                    if (attempt < maxAttempts) {
                        // Use exponential backoff with jitter
                        const delay = initialDelay * Math.pow(2, attempt - 1) * (0.75 + Math.random() * 0.5);
                        console.log(`⏱️ Retrying backend notification in ${Math.round(delay/1000)}s...`);
                        
                        setTimeout(() => {
                            notifyBackendWithRetry(attempt + 1, maxAttempts, initialDelay);
                        }, delay);
                    } else {
                        console.error('❌ Failed to notify backend after multiple attempts. User should check history later.');
                    }
                });
            };
            
            // Start the retry process
            notifyBackendWithRetry();
            
            // Return success immediately - don't wait for processing
            return {
                url: publicUrl.publicUrl,
                id: fileId,
                status: 'completed'
            };
        }
    } catch (error: any) {
        console.error("❌ Direct Upload Error:", error);
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