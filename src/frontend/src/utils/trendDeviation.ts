import { getUnifiedProviderIndicators } from "../data/mockData";

export interface DeviationAlert {
  providerId: string;
  providerName: string;
  indicator: string;
  currentValue: number;
  previousValue: number;
  percentChange: number;
  direction: "spike" | "drop";
  severity: "critical" | "warning";
  message: string;
}

export function getPreviousQuarter(quarter: string): string {
  const [qPart, yearPart] = quarter.split("-");
  const qNum = Number.parseInt(qPart.replace("Q", ""), 10);
  const year = Number.parseInt(yearPart, 10);
  if (qNum === 1) {
    return `Q4-${year - 1}`;
  }
  return `Q${qNum - 1}-${year}`;
}

export function detectDeviations(
  providerId: string,
  providerName: string,
  currentQuarter: string,
  previousQuarter: string,
): DeviationAlert[] {
  const currentInds = getUnifiedProviderIndicators(providerId, currentQuarter);
  const previousInds = getUnifiedProviderIndicators(
    providerId,
    previousQuarter,
  );

  const alerts: DeviationAlert[] = [];

  for (const curr of currentInds) {
    const prev = previousInds.find(
      (i) => i.indicatorCode === curr.indicatorCode,
    );
    if (!prev || prev.rate === 0) continue;

    const percentChange = ((curr.rate - prev.rate) / prev.rate) * 100;
    const absChange = Math.abs(percentChange);

    if (absChange <= 20) continue;

    let isBad = false;
    let direction: "spike" | "drop";

    if (curr.isLowerBetter) {
      // Increase is bad for lower_is_better
      if (percentChange > 20) {
        isBad = true;
        direction = "spike";
      } else {
        continue; // Decrease is good, skip
      }
    } else {
      // Decrease is bad for higher_is_better
      if (percentChange < -20) {
        isBad = true;
        direction = "drop";
      } else {
        continue; // Increase is good, skip
      }
    }

    if (!isBad) continue;

    const severity: "critical" | "warning" =
      absChange > 35 ? "critical" : "warning";
    const dirWord = direction === "spike" ? "increased" : "decreased";
    const message = `${curr.indicatorName} ${dirWord} by ${absChange.toFixed(1)}% compared to ${previousQuarter}`;

    alerts.push({
      providerId,
      providerName,
      indicator: curr.indicatorName,
      currentValue: curr.rate,
      previousValue: prev.rate,
      percentChange,
      direction,
      severity,
      message,
    });
  }

  return alerts;
}
