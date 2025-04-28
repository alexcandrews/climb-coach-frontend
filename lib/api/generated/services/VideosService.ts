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
}
