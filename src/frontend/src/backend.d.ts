import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HighRiskCohort {
    id: string;
    status: string;
    urgency: string;
    riskCriteria: string;
    flagDate: bigint;
    cohortSize: bigint;
    providerId: string;
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
export interface ScreeningWorkflow {
    id: string;
    status: string;
    completionTimeHours: number;
    dueDate: bigint;
    screeningType: string;
    providerId: string;
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
export interface NationalOverviewStats {
    dataQualityScore: number;
    screeningComplianceRate: number;
    totalProviders: bigint;
    highRiskFlagged: bigint;
    avgPreventiveScore: number;
    totalResidents: bigint;
    avgSafetyScore: number;
}
export interface UserProfile {
    name: string;
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
    getAllScreeningWorkflows(): Promise<Array<ScreeningWorkflow>>;
    getAuditLogs(): Promise<Array<AuditLog>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHighRiskCohorts(providerId: string): Promise<Array<HighRiskCohort>>;
    getIndicatorResults(providerId: string, quarter: string): Promise<Array<IndicatorResult>>;
    getNationalOverviewStats(_quarter: string): Promise<NationalOverviewStats>;
    getScorecardsByProvider(providerId: string): Promise<Array<ProviderScorecard>>;
    getScreeningWorkflows(providerId: string): Promise<Array<ScreeningWorkflow>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateScreeningStatus(workflowId: string, status: string): Promise<void>;
}
