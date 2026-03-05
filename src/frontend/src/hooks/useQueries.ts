import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AuditLog,
  HighRiskCohort,
  IndicatorResult,
  NationalOverviewStats,
  ProviderIndicatorSubmission,
  ProviderScorecard,
  RatingEngineResult,
  ScreeningWorkflow,
} from "../backend.d";
import { useActor } from "./useActor";

export function useNationalOverviewStats(quarter: string) {
  const { actor, isFetching } = useActor();
  return useQuery<NationalOverviewStats | null>({
    queryKey: ["nationalOverviewStats", quarter],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNationalOverviewStats(quarter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllHighRiskCohorts() {
  const { actor, isFetching } = useActor();
  return useQuery<HighRiskCohort[]>({
    queryKey: ["allHighRiskCohorts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHighRiskCohorts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllScreeningWorkflows() {
  const { actor, isFetching } = useActor();
  return useQuery<ScreeningWorkflow[]>({
    queryKey: ["allScreeningWorkflows"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllScreeningWorkflows();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAuditLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<AuditLog[]>({
    queryKey: ["auditLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAuditLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useScorecardsByProvider(providerId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ProviderScorecard[]>({
    queryKey: ["scorecards", providerId],
    queryFn: async () => {
      if (!actor || !providerId) return [];
      return actor.getScorecardsByProvider(providerId);
    },
    enabled: !!actor && !isFetching && !!providerId,
  });
}

export function useIndicatorResults(providerId: string, quarter: string) {
  const { actor, isFetching } = useActor();
  return useQuery<IndicatorResult[]>({
    queryKey: ["indicatorResults", providerId, quarter],
    queryFn: async () => {
      if (!actor || !providerId) return [];
      return actor.getIndicatorResults(providerId, quarter);
    },
    enabled: !!actor && !isFetching && !!providerId,
  });
}

export function useUpdateScreeningStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      workflowId,
      status,
    }: {
      workflowId: string;
      status: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateScreeningStatus(workflowId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allScreeningWorkflows"] });
    },
  });
}

export function useRatingEngineResult(providerId: string, quarter: string) {
  const { actor, isFetching } = useActor();
  return useQuery<RatingEngineResult | null>({
    queryKey: ["ratingEngineResult", providerId, quarter],
    queryFn: async () => {
      if (!actor || !providerId) return null;
      return actor.getRatingEngineResult(providerId, quarter);
    },
    enabled: !!actor && !isFetching && !!providerId,
  });
}

export function useAllRatingEngineResults(quarter: string) {
  const { actor, isFetching } = useActor();
  return useQuery<RatingEngineResult[]>({
    queryKey: ["ratingEngineResults", quarter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRatingEngineResults(quarter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProviderScorecardV2(providerId: string, quarter: string) {
  const { actor, isFetching } = useActor();
  return useQuery<RatingEngineResult | null>({
    queryKey: ["providerScorecardV2", providerId, quarter],
    queryFn: async () => {
      if (!actor || !providerId) return null;
      return actor.getProviderScorecardV2(providerId, quarter);
    },
    enabled: !!actor && !isFetching && !!providerId,
  });
}

export function useSubmitIndicatorData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submission: ProviderIndicatorSubmission) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitIndicatorData(submission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratingEngineResults"] });
      queryClient.invalidateQueries({ queryKey: ["providerScorecardV2"] });
    },
  });
}

export function useAddAuditLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      userRole: string;
      action: string;
      entityType: string;
      details: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addAuditLogEntry(
        params.userId,
        params.userRole,
        params.action,
        params.entityType,
        params.details,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
    },
  });
}
