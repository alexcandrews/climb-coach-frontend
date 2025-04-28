/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class HealthService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Check API health status
     * @returns any API is healthy
     * @throws ApiError
     */
    public getApiHealth(): CancelablePromise<{
        status?: string;
        /**
         * Current server time
         */
        timestamp?: string;
        /**
         * Server uptime in seconds
         */
        uptime?: number;
        /**
         * API version
         */
        version?: string;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/health',
        });
    }
}
