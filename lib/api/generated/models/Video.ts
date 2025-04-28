/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CoachingInsight } from './CoachingInsight';
export type Video = {
    /**
     * The auto-generated ID of the video
     */
    id: string;
    /**
     * The ID of the video's owner
     */
    user_id: string;
    /**
     * The title of the video
     */
    title?: string;
    /**
     * A description of the video
     */
    description?: string;
    /**
     * URL to the video file
     */
    video_url: string;
    /**
     * URL to the video thumbnail
     */
    thumbnail_url?: string;
    /**
     * The duration of the video in seconds
     */
    duration?: number;
    /**
     * Array of coaching insights for the video
     */
    coaching_insights?: Array<CoachingInsight>;
    /**
     * When the video was uploaded
     */
    created_at?: string;
    /**
     * When the video was last updated
     */
    updated_at?: string;
};

