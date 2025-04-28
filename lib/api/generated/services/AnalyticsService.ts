/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CoachingInsight } from '../models/CoachingInsight';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AnalyticsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Analyze frames extracted from a climbing video
     * @param requestBody
     * @returns any Analysis results containing coaching insights
     * @throws ApiError
     */
    public postApiAnalyzeFrames(
        requestBody: {
            /**
             * Array of frame URLs or base64-encoded image data
             */
            frames: Array<string>;
            /**
             * Optional ID of the related video
             */
            video_id?: string;
        },
    ): CancelablePromise<{
        insights?: Array<CoachingInsight>;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/analyze-frames',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                401: `Unauthorized access, authentication required`,
                500: `Server error`,
            },
        });
    }
}
