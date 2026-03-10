import type { ActivePage, AppRole } from "../App";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AuditGovernance from "./pages/AuditGovernance";
import DataQuality from "./pages/DataQuality";
import HighRiskCohorts from "./pages/HighRiskCohorts";
import NationalOverview from "./pages/NationalOverview";
import PayForImprovement from "./pages/PayForImprovement";
import PolicyAnalytics from "./pages/PolicyAnalytics";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderPerformance from "./pages/ProviderPerformance";
import PublicView from "./pages/PublicView";
import RatingEngine from "./pages/RatingEngine";
import RegionalProviderDrillDown from "./pages/RegionalProviderDrillDown";
import ScreeningTracking from "./pages/ScreeningTracking";
import StateHeatmaps from "./pages/StateHeatmaps";

interface LayoutProps {
  currentRole: AppRole;
  setCurrentRole: (role: AppRole) => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentQuarter: string;
  setCurrentQuarter: (quarter: string) => void;
}

export default function Layout({
  currentRole,
  setCurrentRole,
  activePage,
  setActivePage,
  currentQuarter,
  setCurrentQuarter,
}: LayoutProps) {
  const renderPage = () => {
    // Public role sees the dedicated public provider directory
    if (currentRole === "Public") {
      return <PublicView currentQuarter={currentQuarter} />;
    }

    // Provider role: national_overview defaults to Provider Dashboard
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
        return <AuditGovernance />;
      case "regional_provider":
        return <RegionalProviderDrillDown currentQuarter={currentQuarter} />;
      case "policy_analytics":
        return <PolicyAnalytics />;
      case "rating_engine":
        return <RatingEngine currentQuarter={currentQuarter} />;
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
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentQuarter={currentQuarter}
        setCurrentQuarter={setCurrentQuarter}
      />
      <div className="flex flex-1 overflow-hidden">
        {currentRole !== "Public" && (
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            currentRole={currentRole}
          />
        )}
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>
      <footer
        className="bg-gov-navy-dark text-center py-2 text-xs"
        style={{ color: "oklch(0.65 0.02 240)" }}
      >
        © {new Date().getFullYear()} Australian Government — National Aged Care
        Reporting & Prevention Framework. Built with{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline hover:text-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
