/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthenticationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get the currently authenticated user
     * @returns any Current user information
     * @throws ApiError
     */
    public getApiAuthMe(): CancelablePromise<{
        user?: User;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/auth/me',
            errors: {
                401: `Unauthorized access, authentication required`,
                500: `Server error`,
            },
        });
    }
}
