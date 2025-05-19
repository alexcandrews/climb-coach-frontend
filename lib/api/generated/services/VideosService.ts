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
     * Initialize a video upload by creating a database record
     * @param requestBody
     * @returns any Upload initialized successfully
     * @throws ApiError
     */
    public postApiVideosUploadInitialize(
        requestBody: {
            /**
             * Title for the video
             */
            title: string;
            /**
             * Location where the video was taken (optional)
             */
            location?: string;
            /**
             * Total number of chunks that will be uploaded
             */
            totalChunks: number;
            /**
             * Total file size in bytes
             */
            fileSize: number;
            /**
             * MIME type of the video
             */
            mimeType: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/upload/initialize',
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
     * Update the progress of a chunked upload
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
    ): CancelablePromise<any> {
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
    /**
     * Get a list of all videos for the authenticated user
     * @returns Video A list of videos
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
     * Get a video by ID
     * @param id UUID of the video
     * @returns Video The video object
     * @throws ApiError
     */
    public getApiVideos1(
        id: string,
    ): CancelablePromise<Video> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/videos/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Video not found`,
                500: `Server error`,
            },
        });
    }
    /**
     * Analyze a video and generate coaching insights
     * @param id UUID of the video to analyze
     * @returns any Coaching insights for the video
     * @throws ApiError
     */
    public postApiVideosAnalyze(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/{id}/analyze',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                404: `Video not found`,
                500: `Server error`,
            },
        });
    }
}
