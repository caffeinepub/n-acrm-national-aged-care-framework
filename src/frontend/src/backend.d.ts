import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RatingEngineResult {
    id: string;
    overallScore: number;
    domainScores: RatingEngineDomainScores;
    overallStars: bigint;
    previousOverallStars: bigint;
    auditNotes: string;
    quarter: string;
    incentiveEligibility: RatingEngineIncentiveEligibility;
    calculatedAt: bigint;
    providerId: string;
    indicatorRatings: Array<RatingEngineIndicatorItem>;
}
export interface AuditLog {
    id: string;
    userRole: string;
    action: string;
    userId: string;
    timestamp: bigint;
    details: string;
    entityType: string;
}
export interface RatingEngineIncentiveEligibility {
    tier: string;
    screeningCompletion: number;
    estimatedPayment: number;
    eligible: boolean;
    improvementScore: number;
}
export interface IndicatorResult {
    id: string;
    trend: string;
    nationalBenchmark: number;
    quarter: string;
    rate: number;
    indicatorCode: string;
    indicatorName: string;
    dimension: string;
    providerId: string;
    quintileRank: bigint;
}
export interface NationalOverviewStats {
    dataQualityScore: number;
    screeningComplianceRate: number;
    totalProviders: bigint;
    highRiskFlagged: bigint;
    avgPreventiveScore: number;
    totalResidents: bigint;
    avgSafetyScore: number;
}
export interface HighRiskCohort {
    id: string;
    status: string;
    urgency: string;
    riskCriteria: string;
    flagDate: bigint;
    cohortSize: bigint;
    providerId: string;
}
export interface IndicatorSubmissionRecord {
    trend: string;
    domain: string;
    rate: number;
    indicatorCode: string;
    indicatorName: string;
    screeningCompletion: number;
    quintile: bigint;
    benchmark: number;
}
export interface RatingEngineDomainScores {
    safety: number;
    compliance: number;
    quality: number;
    staffing: number;
    experience: number;
    preventive: number;
}
export interface ScreeningWorkflow {
    id: string;
    status: string;
    completionTimeHours: number;
    dueDate: bigint;
    screeningType: string;
    providerId: string;
}
export interface RatingEngineIndicatorItem {
    trend: string;
    starRating: number;
    domain: string;
    trendAdjustment: number;
    rate: number;
    indicatorCode: string;
    indicatorName: string;
    quintile: bigint;
    benchmark: number;
}
export interface ProviderScorecard {
    id: string;
    experienceScore: number;
    overallScore: number;
    quarter: string;
    safetyScore: number;
    preventiveScore: number;
    providerId: string;
    equityScore: number;
    quintileRank: bigint;
}
export interface UserProfile {
    name: string;
}
export interface ProviderIndicatorSubmission {
    id: string;
    quarter: string;
    previousSafetyScore: number;
    submittedAt: bigint;
    indicators: Array<IndicatorSubmissionRecord>;
    screeningBundleCompletion: number;
    providerId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAuditLogEntry(userId: string, userRole: string, action: string, entityType: string, details: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllHighRiskCohorts(): Promise<Array<HighRiskCohort>>;
    getAllRatingEngineResults(quarter: string): Promise<Array<RatingEngineResult>>;
    getAllScreeningWorkflows(): Promise<Array<ScreeningWorkflow>>;
    getAuditLogs(): Promise<Array<AuditLog>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHighRiskCohorts(providerId: string): Promise<Array<HighRiskCohort>>;
    getIndicatorResults(providerId: string, quarter: string): Promise<Array<IndicatorResult>>;
    getNationalOverviewStats(_quarter: string): Promise<NationalOverviewStats>;
    getProviderScorecardV2(providerId: string, quarter: string): Promise<RatingEngineResult | null>;
    getRatingEngineResult(providerId: string, quarter: string): Promise<RatingEngineResult | null>;
    getScorecardsByProvider(providerId: string): Promise<Array<ProviderScorecard>>;
    getScreeningWorkflows(providerId: string): Promise<Array<ScreeningWorkflow>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitIndicatorData(submission: ProviderIndicatorSubmission): Promise<RatingEngineResult>;
    updateScreeningStatus(workflowId: string, status: string): Promise<void>;
}
