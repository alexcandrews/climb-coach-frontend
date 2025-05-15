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
             * Public URL of the video in Supabase storage
             */
            videoUrl: string;
            /**
             * Unique ID for the video
             */
            videoId: string;
            /**
             * Original file name
             */
            fileName?: string;
            /**
             * MIME type of the video
             */
            contentType?: string;
            /**
             * Size of the video in bytes
             */
            size?: number;
            /**
             * Title for the video
             */
            title?: string;
            /**
             * Location where the video was recorded
             */
            location?: string;
        },
    ): CancelablePromise<{
        /**
         * URL of the uploaded video
         */
        url?: string;
        /**
         * ID of the video
         */
        id?: string;
        /**
         * Success message
         */
        message?: string;
        /**
         * Upload timestamp
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
                500: `Server error`,
            },
        });
    }
    /**
     * Combine chunks of a video uploaded directly to Supabase storage
     * @param requestBody
     * @returns any Chunks combined successfully and analysis started
     * @throws ApiError
     */
    public postApiVideosCombineChunks(
        requestBody: {
            /**
             * Unique ID for the video
             */
            videoId: string;
            /**
             * ID of the user who uploaded the video
             */
            userId: string;
            /**
             * Path to the video in Supabase storage
             */
            fileName: string;
            /**
             * Total number of chunks to combine
             */
            totalChunks: number;
            /**
             * MIME type of the video
             */
            contentType?: string;
            /**
             * Size of the video in bytes
             */
            size?: number;
            /**
             * Title for the video
             */
            title?: string;
            /**
             * Location where the video was recorded
             */
            location?: string;
        },
    ): CancelablePromise<{
        /**
         * URL of the combined video
         */
        url?: string;
        /**
         * ID of the video
         */
        id?: string;
        /**
         * Success message
         */
        message?: string;
        /**
         * Timestamp
         */
        timestamp?: string;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/combine-chunks',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Not authenticated`,
                403: `Permission denied`,
                500: `Server error`,
            },
        });
    }
}
