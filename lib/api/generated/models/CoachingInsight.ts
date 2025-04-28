/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CoachingInsight = {
    /**
     * Time in seconds where this feedback applies
     */
    timestamp?: number;
    /**
     * The coaching feedback
     */
    feedback?: string;
    /**
     * The type of feedback
     */
    type?: CoachingInsight.type;
    /**
     * Confidence score of the insight (0-1)
     */
    confidence?: number;
};
export namespace CoachingInsight {
    /**
     * The type of feedback
     */
    export enum type {
        BALANCE = 'balance',
        TECHNIQUE = 'technique',
        EFFICIENCY = 'efficiency',
        SAFETY = 'safety',
        FORM = 'form',
        STRATEGY = 'strategy',
    }
}

