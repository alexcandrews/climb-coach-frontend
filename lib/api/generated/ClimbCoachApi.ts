/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { AnalyticsService } from './services/AnalyticsService';
import { AuthenticationService } from './services/AuthenticationService';
import { HealthService } from './services/HealthService';
import { ProfilesService } from './services/ProfilesService';
import { VideosService } from './services/VideosService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class ClimbCoachApi {
    public readonly analytics: AnalyticsService;
    public readonly authentication: AuthenticationService;
    public readonly health: HealthService;
    public readonly profiles: ProfilesService;
    public readonly videos: VideosService;
    public readonly request: BaseHttpRequest;
    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'http://localhost:8000',
            VERSION: config?.VERSION ?? '1.0.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });
        this.analytics = new AnalyticsService(this.request);
        this.authentication = new AuthenticationService(this.request);
        this.health = new HealthService(this.request);
        this.profiles = new ProfilesService(this.request);
        this.videos = new VideosService(this.request);
    }
}

