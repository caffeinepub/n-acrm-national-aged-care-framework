import { getUnifiedProviderIndicators } from "../data/mockData";

export interface RiskPrediction {
  providerId: string;
  predictedRisk: "Low" | "Medium" | "High";
  confidence: number;
  explanation: string;
  trendSignals: string[];
}

const QUARTERS_ORDERED = [
  "Q1-2024",
  "Q2-2024",
  "Q3-2024",
  "Q4-2024",
  "Q1-2025",
  "Q2-2025",
  "Q3-2025",
  "Q4-2025",
];

export function predictProviderRisk(
  providerId: string,
  _providerName: string,
  quarters: string[],
): RiskPrediction {
  const lastFour = quarters.slice(-4);
  if (lastFour.length < 2) {
    return {
      providerId,
      predictedRisk: "Low",
      confidence: 70,
      explanation: "Insufficient data for prediction",
      trendSignals: [],
    };
  }

  // Get indicators for each quarter
  const quarterData = lastFour.map((q) => ({
    quarter: q,
    indicators: getUnifiedProviderIndicators(providerId, q),
  }));

  const trendSignals: string[] = [];
  let decliningCount = 0;

  // Check each indicator across quarters
  if (quarterData.length >= 2) {
    const firstQ = quarterData[0].indicators;
    const lastQ = quarterData[quarterData.length - 1].indicators;

    for (const ind of lastQ) {
      const firstInd = firstQ.find(
        (i) => i.indicatorCode === ind.indicatorCode,
      );
      if (!firstInd) continue;

      if (ind.isLowerBetter) {
        // For lower_is_better (falls, harm), increasing is bad
        const pctChange =
          firstInd.rate !== 0
            ? ((ind.rate - firstInd.rate) / firstInd.rate) * 100
            : 0;
        if (pctChange > 10) {
          decliningCount++;
          trendSignals.push(
            `${ind.indicatorName} increased ${pctChange.toFixed(0)}% over tracked period`,
          );
        }
      } else {
        // For higher_is_better (screening, satisfaction), decreasing is bad
        const pctChange =
          firstInd.rate !== 0
            ? ((ind.rate - firstInd.rate) / firstInd.rate) * 100
            : 0;
        if (pctChange < -10) {
          decliningCount++;
          trendSignals.push(
            `${ind.indicatorName} declined ${Math.abs(pctChange).toFixed(0)}% over tracked period`,
          );
        }
      }
    }

    // Also check recent quarter-over-quarter for the most recent shift
    if (quarterData.length >= 2) {
      const prevQ = quarterData[quarterData.length - 2].indicators;
      const currQ = quarterData[quarterData.length - 1].indicators;
      for (const ind of currQ) {
        const prevInd = prevQ.find(
          (i) => i.indicatorCode === ind.indicatorCode,
        );
        if (!prevInd) continue;
        if (
          ind.isLowerBetter &&
          ind.rate > prevInd.rate * 1.15 &&
          !trendSignals.some((s) => s.startsWith(ind.indicatorName))
        ) {
          trendSignals.push(`${ind.indicatorName} spiked in latest quarter`);
        }
      }
    }
  }

  let predictedRisk: "Low" | "Medium" | "High";
  let confidence: number;
  let explanation: string;

  if (decliningCount >= 3) {
    predictedRisk = "High";
    confidence = 80 + Math.min(12, decliningCount * 2);
    explanation = `Risk predicted due to ${trendSignals.slice(0, 3).join("; ")}`;
  } else if (decliningCount >= 1) {
    predictedRisk = "Medium";
    confidence = 60 + Math.min(19, decliningCount * 8);
    explanation = `Moderate risk due to ${trendSignals.slice(0, 2).join("; ")}`;
  } else {
    predictedRisk = "Low";
    confidence = 70 + Math.floor(Math.random() * 18);
    explanation =
      "Provider shows stable or improving trends across key indicators";
  }

  return {
    providerId,
    predictedRisk,
    confidence: Math.min(95, confidence),
    explanation,
    trendSignals: trendSignals.slice(0, 4),
  };
}

export { QUARTERS_ORDERED };
