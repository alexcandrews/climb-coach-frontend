/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Profile = {
    /**
     * The user ID who owns this profile
     */
    id: string;
    /**
     * The user's display name
     */
    name?: string;
    /**
     * Number of years of climbing experience
     */
    years_climbing?: number;
    /**
     * The user's main climbing goals
     */
    primary_goals?: string;
    /**
     * The user's self-assessed climbing skill level
     */
    skill_level?: Profile.skill_level;
    /**
     * Types of climbing the user practices
     */
    climbing_styles?: Array<string>;
    /**
     * When the profile was created
     */
    created_at?: string;
    /**
     * When the profile was last updated
     */
    updated_at?: string;
};
export namespace Profile {
    /**
     * The user's self-assessed climbing skill level
     */
    export enum skill_level {
        BEGINNER = 'Beginner',
        INTERMEDIATE = 'Intermediate',
        ADVANCED = 'Advanced',
        EXPERT = 'Expert',
    }
}

