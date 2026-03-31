import { useState } from "react";
import type { ActivePage, AppRole } from "../App";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AuditGovernance from "./pages/AuditGovernance";
import CareResources from "./pages/CareResources";
import DataQuality from "./pages/DataQuality";
import HighRiskCohorts from "./pages/HighRiskCohorts";
import MyReviews from "./pages/MyReviews";
import NationalOverview from "./pages/NationalOverview";
import PayForImprovement from "./pages/PayForImprovement";
import PolicyAnalytics from "./pages/PolicyAnalytics";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderPerformance from "./pages/ProviderPerformance";
import PublicBookings from "./pages/PublicBookings";
import PublicView from "./pages/PublicView";
import RatingEngine from "./pages/RatingEngine";
import RegionalProviderDrillDown from "./pages/RegionalProviderDrillDown";
import RegulatorIntelligence from "./pages/RegulatorIntelligence";
import ScreeningTracking from "./pages/ScreeningTracking";
import StateHeatmaps from "./pages/StateHeatmaps";

interface LayoutProps {
  currentRole: AppRole;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentQuarter: string;
  setCurrentQuarter: (quarter: string) => void;
  onRoleSwitch: (role: AppRole) => void;
  onGoHome: () => void;
}

export default function Layout({
  currentRole,
  activePage,
  setActivePage,
  currentQuarter,
  setCurrentQuarter,
  onRoleSwitch,
  onGoHome,
}: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    if (currentRole === "Public") {
      switch (activePage) {
        case "public_bookings":
          return <PublicBookings currentQuarter={currentQuarter} />;
        case "care_resources":
          return <CareResources />;
        case "my_reviews":
          return <MyReviews />;
        default:
          return <PublicView currentQuarter={currentQuarter} />;
      }
    }

    if (currentRole === "Provider" && activePage === "national_overview") {
      return <ProviderDashboard />;
    }

    switch (activePage) {
      case "national_overview":
        return (
          <NationalOverview
            currentQuarter={currentQuarter}
            setActivePage={setActivePage}
          />
        );
      case "state_heatmaps":
        return <StateHeatmaps />;
      case "provider_performance":
        return <ProviderPerformance currentQuarter={currentQuarter} />;
      case "high_risk_cohorts":
        return <HighRiskCohorts />;
      case "screening_tracking":
        return <ScreeningTracking />;
      case "pay_for_improvement":
        return <PayForImprovement currentQuarter={currentQuarter} />;
      case "data_quality":
        return <DataQuality />;
      case "audit_governance":
        return <AuditGovernance currentRole={currentRole} />;
      case "regional_provider":
        return <RegionalProviderDrillDown currentQuarter={currentQuarter} />;
      case "policy_analytics":
        return <PolicyAnalytics />;
      case "rating_engine":
        return <RatingEngine currentQuarter={currentQuarter} />;
      case "regulator_intelligence":
        return <RegulatorIntelligence currentQuarter={currentQuarter} />;
      default:
        return (
          <NationalOverview
            currentQuarter={currentQuarter}
            setActivePage={setActivePage}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header
        currentRole={currentRole}
        currentQuarter={currentQuarter}
        setCurrentQuarter={setCurrentQuarter}
        onRoleSwitch={onRoleSwitch}
        onGoHome={onGoHome}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          currentRole={currentRole}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />
        <main className="flex-1 overflow-y-auto bg-background">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
