import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Layout from "./components/Layout";

export type AppRole = "Regulator" | "Provider" | "Policy Analyst" | "Public";
export type ActivePage =
  | "national_overview"
  | "state_heatmaps"
  | "provider_performance"
  | "high_risk_cohorts"
  | "screening_tracking"
  | "pay_for_improvement"
  | "data_quality"
  | "audit_governance"
  | "regional_provider"
  | "policy_analytics"
  | "rating_engine";

function App() {
  const [currentRole, setCurrentRole] = useState<AppRole>("Regulator");
  const [activePage, setActivePage] = useState<ActivePage>("national_overview");
  const [currentQuarter, setCurrentQuarter] = useState("Q4-2025");

  return (
    <>
      <Layout
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activePage={activePage}
        setActivePage={setActivePage}
        currentQuarter={currentQuarter}
        setCurrentQuarter={setCurrentQuarter}
      />
      <Toaster />
    </>
  );
}

export default App;
