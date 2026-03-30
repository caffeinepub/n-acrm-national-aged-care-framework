import type { DeviationAlert } from "./trendDeviation";

export type ActionPriority = "High" | "Medium" | "Low";
export type ActionType =
  | "Audit"
  | "Monitoring"
  | "Warning"
  | "Incentive"
  | "Support";

export interface DecisionRecommendation {
  providerId: string;
  providerName: string;
  action: string;
  actionType: ActionType;
  priority: ActionPriority;
  explanation: string;
  details: string[];
}

export function generateRecommendation(
  providerId: string,
  providerName: string,
  stars: number,
  predictedRisk: "Low" | "Medium" | "High",
  deviationAlerts: DeviationAlert[],
  _currentQuarter: string,
): DecisionRecommendation {
  const criticalDeviations = deviationAlerts.filter(
    (a) => a.severity === "critical",
  );
  const hasCritical = criticalDeviations.length > 0;
  const hasAnyDeviation = deviationAlerts.length > 0;

  let action: string;
  let actionType: ActionType;
  let priority: ActionPriority;
  let explanation: string;
  let details: string[];

  if (predictedRisk === "High" && hasCritical) {
    actionType = "Audit";
    priority = "High";
    action = "Send Audit Team";
    explanation = `Audit recommended due to high predicted risk and critical deviation in ${criticalDeviations[0]?.indicator ?? "key indicators"}`;
    details = [
      `Predicted risk level: HIGH (${predictedRisk})`,
      `Critical deviations detected: ${criticalDeviations.length}`,
      ...criticalDeviations.slice(0, 2).map((d) => `• ${d.message}`),
      "Recommend on-site audit within 14 days",
      "Notify ACQSC regional office",
    ];
  } else if (predictedRisk === "High") {
    actionType = "Warning";
    priority = "High";
    action = "Issue Compliance Warning";
    explanation = `Compliance warning recommended due to consistently high predicted risk (${stars.toFixed(1)}★ rating)`;
    details = [
      `Current star rating: ${stars.toFixed(1)} ★`,
      "Predicted risk trajectory: HIGH",
      "Issue formal compliance notice within 7 days",
      "Schedule follow-up review in 30 days",
      hasAnyDeviation
        ? `Performance deviations detected: ${deviationAlerts.length}`
        : "No acute deviations but trend concerning",
    ];
  } else if (predictedRisk === "Medium" && hasAnyDeviation) {
    actionType = "Monitoring";
    priority = "Medium";
    action = "Increase Monitoring Frequency";
    explanation = `Increased monitoring recommended due to medium predicted risk combined with ${deviationAlerts.length} performance deviation(s)`;
    details = [
      `Current star rating: ${stars.toFixed(1)} ★`,
      "Predicted risk: MEDIUM",
      `Active deviations: ${deviationAlerts.length}`,
      "Increase reporting frequency to monthly",
      "Assign dedicated monitoring officer",
    ];
  } else if (predictedRisk === "Medium" && stars < 3.5) {
    actionType = "Support";
    priority = "Medium";
    action = "Provide Additional Funding Support";
    explanation = `Support package recommended — provider rated ${stars.toFixed(1)}★ with medium risk trajectory and limited resources`;
    details = [
      `Current star rating: ${stars.toFixed(1)} ★`,
      "Below sector average performance",
      "Consider targeted improvement grant",
      "Assign sector development advisor",
      "Review staffing resource allocation",
    ];
  } else if (predictedRisk === "Low" && stars >= 4.0) {
    actionType = "Incentive";
    priority = "Low";
    action = "Consider Performance Incentive";
    explanation =
      "Strong performance with low predicted risk \u2014 eligible for Pay-for-Improvement incentive program";
    details = [
      `Current star rating: ${stars.toFixed(1)} ★ (above sector average)`,
      "Low predicted risk across all indicators",
      "Eligible for performance incentive payment",
      "Consider as sector benchmark case study",
    ];
  } else {
    actionType = "Monitoring";
    priority = "Low";
    action = "Continue Standard Monitoring";
    explanation =
      "Provider is within normal operating parameters \u2014 continue standard quarterly monitoring cycle";
    details = [
      `Current star rating: ${stars.toFixed(1)} ★`,
      `Predicted risk: ${predictedRisk}`,
      "No immediate action required",
      "Review at next scheduled assessment",
    ];
  }

  return {
    providerId,
    providerName,
    action,
    actionType,
    priority,
    explanation,
    details,
  };
}
