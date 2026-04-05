import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Layout from "./components/Layout";
import RoleSelectionDashboard from "./components/RoleSelectionDashboard";
import HomePage from "./components/pages/HomePage";
import { BookingProvider } from "./context/BookingContext";

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
  | "rating_engine"
  | "regulator_intelligence"
  | "public_bookings"
  | "care_resources"
  | "my_reviews"
  | "provider_comparison"
  | "ai_assistant";

function App() {
  const [hasSelectedRole, setHasSelectedRole] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [currentRole, setCurrentRole] = useState<AppRole>("Regulator");
  const [activePage, setActivePage] = useState<ActivePage>("national_overview");
  const [currentQuarter, setCurrentQuarter] = useState("Q4-2025");

  const handleRoleSelect = (role: AppRole) => {
    setCurrentRole(role);
    setHasSelectedRole(true);
  };

  const handleRoleSelectFromHome = (role: AppRole) => {
    setCurrentRole(role);
    setHasSelectedRole(true);
    setShowHome(false);
    setActivePage("national_overview");
  };

  const handleRoleSwitch = (role: AppRole) => {
    setCurrentRole(role);
    setActivePage("national_overview");
  };

  const handleGoHome = () => {
    setShowHome(true);
    setHasSelectedRole(false);
  };

  if (showHome && !hasSelectedRole) {
    return (
      <BookingProvider currentQuarter={currentQuarter}>
        <HomePage onRoleSelect={handleRoleSelectFromHome} />
        <Toaster />
      </BookingProvider>
    );
  }

  if (!hasSelectedRole) {
    return (
      <BookingProvider currentQuarter={currentQuarter}>
        <RoleSelectionDashboard onRoleSelect={handleRoleSelect} />
      </BookingProvider>
    );
  }

  return (
    <BookingProvider currentQuarter={currentQuarter}>
      <Layout
        currentRole={currentRole}
        activePage={activePage}
        setActivePage={setActivePage}
        currentQuarter={currentQuarter}
        setCurrentQuarter={setCurrentQuarter}
        onRoleSwitch={handleRoleSwitch}
        onGoHome={handleGoHome}
      />
      <Toaster />
    </BookingProvider>
  );
}

export default App;
