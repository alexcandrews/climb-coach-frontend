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
     * Prepare a direct-to-storage upload session
     * @param requestBody
     * @returns any Upload session initialised successfully
     * @throws ApiError
     */
    public postApiVideosUploadInitialize(
        requestBody: {
            /**
             * Title for the uploaded video
             */
            title: string;
            /**
             * Optional location description supplied by the client
             */
            location?: string;
            /**
             * File size in bytes
             */
            fileSize: number;
            /**
             * MIME type reported by the client
             */
            mimeType: string;
            /**
             * Original filename provided by the client
             */
            originalName?: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/upload/initialize',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request payload`,
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
    /**
     * Mark a video upload as complete and queue processing
     * @param id ID of the uploaded video
     * @param requestBody
     * @returns any Upload marked as complete
     * @throws ApiError
     */
    public postApiVideosMarkUploaded(
        id: string,
        requestBody: {
            /**
             * Size of the uploaded file in bytes
             */
            fileSize?: number;
            /**
             * MIME type reported by the client
             */
            mimeType?: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/videos/{id}/mark-uploaded',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request payload`,
                401: `Unauthorized`,
                404: `Video not found`,
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
