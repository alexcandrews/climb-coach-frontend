/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Profile } from '../models/Profile';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ProfilesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get the authenticated user's profile
     * @returns any User profile information
     * @throws ApiError
     */
    public getApiProfiles(): CancelablePromise<{
        profile?: Profile;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/profiles',
            errors: {
                401: `Unauthorized access, authentication required`,
                500: `Server error`,
            },
        });
    }
    /**
     * Update the authenticated user's profile
     * @param requestBody
     * @returns any Profile updated successfully
     * @throws ApiError
     */
    public putApiProfiles(
        requestBody: {
            /**
             * User's display name
             */
            name?: string;
            /**
             * Years of climbing experience
             */
            years_climbing?: number;
            /**
             * User's main climbing goals
             */
            primary_goals?: string;
            /**
             * Self-assessed climbing skill level
             */
            skill_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
            /**
             * Types of climbing the user practices
             */
            climbing_styles?: Array<string>;
        },
    ): CancelablePromise<{
        message?: string;
        profile?: Profile;
    }> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/profiles',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized access, authentication required`,
                500: `Server error`,
            },
        });
    }
}
