/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Video } from '../models/Video';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class VideosService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get all videos for the authenticated user
     * @returns Video List of videos
     * @throws ApiError
     */
    public getApiVideos(): CancelablePromise<Array<Video>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/videos',
            errors: {
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * Get a specific video by ID
     * @param videoId The video ID
     * @returns Video Video details
     * @throws ApiError
     */
    public getApiVideos1(
        videoId: string,
    ): CancelablePromise<Video> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/videos/{videoId}',
            path: {
                'videoId': videoId,
            },
            errors: {
                401: `Unauthorized`,
                404: `Video not found`,
                500: `Server error`,
            },
        });
    }
    /**
     * Upload a new video
     * @param formData
     * @returns any Video uploaded successfully
     * @throws ApiError
     */
    public postApiVideosUpload(
        formData: {
            /**
             * The video file (MP4, MOV, or AVI)
             */
            video: Blob;
            /**
             * Title of the video
             */
            title: string;
            /**
             * Description of the video
             */
            description?: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * Start a chunked video upload session
     * @param requestBody
     * @returns any Upload session started
     * @throws ApiError
     */
    public postApiVideosUploadStart(
        requestBody: {
            /**
             * Original filename
             */
            filename: string;
            /**
             * MIME type of the video
             */
            contentType: string;
            /**
             * Total file size in bytes
             */
            totalSize: number;
            /**
             * Total number of chunks
             */
            totalChunks: number;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/upload/start',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * Upload a chunk of a video file
     * @param formData
     * @returns any Chunk uploaded successfully
     * @throws ApiError
     */
    public postApiVideosUploadChunk(
        formData: {
            /**
             * The chunk data
             */
            chunk: Blob;
            /**
             * Upload session ID
             */
            uploadId: string;
            /**
             * Index of the chunk (0-based)
             */
            chunkIndex: number;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/upload/chunk',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * Complete a chunked video upload
     * @param requestBody
     * @returns any Upload completed successfully
     * @throws ApiError
     */
    public postApiVideosUploadComplete(
        requestBody: {
            /**
             * Upload session ID
             */
            uploadId: string;
            /**
             * Total number of chunks
             */
            totalChunks: number;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/upload/complete',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * Analyze a specific video and get coaching insights
     * @param videoId The video ID to analyze
     * @returns any Analysis started
     * @throws ApiError
     */
    public postApiVideosAnalyze(
        videoId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/{videoId}/analyze',
            path: {
                'videoId': videoId,
            },
            errors: {
                401: `Unauthorized`,
                404: `Video not found`,
                500: `Server error`,
            },
        });
    }
    /**
     * Get coaching insights for a specific video
     * @param videoId The video ID
     * @returns any Video coaching insights
     * @throws ApiError
     */
    public getApiVideosInsights(
        videoId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/videos/{videoId}/insights',
            path: {
                'videoId': videoId,
            },
            errors: {
                401: `Unauthorized`,
                404: `Video not found or insights not available`,
                500: `Server error`,
            },
        });
    }
    /**
     * Process a video uploaded directly to Supabase storage
     * @param requestBody
     * @returns any Video processed successfully and analysis started
     * @throws ApiError
     */
    public postApiVideosProcessExternalUpload(
        requestBody: {
            /**
             * Unique ID for the video from initialization
             */
            uploadId: string;
            /**
             * Updated status for the video
             */
            status?: string;
            /**
             * Number of chunks uploaded (should be 1 for small files)
             */
            uploadedChunks?: number;
            /**
             * Total number of chunks (should be 1 for small files)
             */
            totalChunks?: number;
        },
    ): CancelablePromise<{
        /**
         * ID of the video
         */
        id?: string;
        /**
         * Success message
         */
        message?: string;
        /**
         * Timestamp of processing
         */
        timestamp?: string;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/process-external-upload',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Not authenticated`,
                403: `Not authorized`,
                404: `Video not found`,
                500: `Server error`,
            },
        });
    }
    /**
     * Initialize a video upload by creating a database record
     * @param requestBody
     * @returns any Upload initialized successfully
     * @throws ApiError
     */
    public postApiVideosUploadInitialize(
        requestBody: {
            /**
             * Title of the video provided by the user
             */
            title: string;
            /**
             * Location where the video was recorded (optional)
             */
            location?: string;
            /**
             * Total number of chunks to be uploaded
             */
            totalChunks: number;
            /**
             * Total size of the file in bytes
             */
            fileSize: number;
            /**
             * MIME type of the video file
             */
            mimeType: string;
        },
    ): CancelablePromise<{
        /**
         * Unique ID for the upload
         */
        uploadId?: string;
        /**
         * File name pattern to use for chunk uploads
         */
        fileName?: string;
        /**
         * Success message
         */
        message?: string;
        /**
         * Initialization timestamp
         */
        timestamp?: string;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/upload/initialize',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Missing required fields`,
                401: `User not authenticated`,
                500: `Server error`,
            },
        });
    }
    /**
     * Update the chunk progress for an ongoing upload
     * @param requestBody
     * @returns any Chunk progress updated successfully
     * @throws ApiError
     */
    public postApiVideosUpdateChunkProgress(
        requestBody: {
            /**
             * The upload ID returned from initialize
             */
            uploadId: string;
            /**
             * Number of chunks uploaded so far
             */
            uploadedChunks: number;
        },
    ): CancelablePromise<{
        /**
         * The upload ID
         */
        uploadId?: string;
        /**
         * Number of chunks uploaded
         */
        uploadedChunks?: number;
        /**
         * Success message
         */
        message?: string;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/update-chunk-progress',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Missing required fields`,
                401: `User not authenticated`,
                403: `User doesn't own this upload`,
                404: `Upload not found`,
                500: `Server error`,
            },
        });
    }
}
