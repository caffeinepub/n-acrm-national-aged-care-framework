import {
  AlertTriangle,
  BarChart2,
  Building2,
  Calculator,
  ClipboardCheck,
  Database,
  FileText,
  LineChart,
  MapPin,
  Search,
  TrendingUp,
} from "lucide-react";
import type { ActivePage, AppRole } from "../App";

interface NavItem {
  id: ActivePage;
  label: string;
  labelOverride?: Partial<Record<AppRole, string>>;
  icon: React.ComponentType<{ className?: string }>;
  roles: AppRole[];
  ocid: string;
}

const navItems: NavItem[] = [
  {
    id: "national_overview",
    label: "National Overview",
    labelOverride: { Provider: "My Dashboard" },
    icon: BarChart2,
    roles: ["Regulator", "Provider", "Policy Analyst"],
    ocid: "nav.national_overview.link",
  },
  {
    id: "regional_provider",
    label: "Regional Provider Lookup",
    icon: Search,
    roles: ["Regulator"],
    ocid: "nav.regional_provider.link",
  },
  {
    id: "state_heatmaps",
    label: "State & Regional Heatmaps",
    icon: MapPin,
    roles: ["Regulator", "Policy Analyst"],
    ocid: "nav.state_heatmaps.link",
  },
  {
    id: "provider_performance",
    label: "Provider Performance",
    icon: Building2,
    roles: ["Regulator"],
    ocid: "nav.provider_performance.link",
  },
  {
    id: "policy_analytics",
    label: "Policy Analytics",
    icon: LineChart,
    roles: ["Regulator", "Policy Analyst"],
    ocid: "nav.policy_analytics.link",
  },
  {
    id: "high_risk_cohorts",
    label: "High-Risk Cohort Monitoring",
    icon: AlertTriangle,
    roles: ["Regulator", "Provider"],
    ocid: "nav.high_risk_cohorts.link",
  },
  {
    id: "screening_tracking",
    label: "Screening Bundle Tracking",
    icon: ClipboardCheck,
    roles: ["Regulator", "Provider"],
    ocid: "nav.screening_tracking.link",
  },
  {
    id: "pay_for_improvement",
    label: "Pay-for-Improvement",
    icon: TrendingUp,
    roles: ["Regulator", "Provider", "Policy Analyst"],
    ocid: "nav.pay_for_improvement.link",
  },
  {
    id: "data_quality",
    label: "Data Quality Dashboard",
    icon: Database,
    roles: ["Regulator", "Provider"],
    ocid: "nav.data_quality.link",
  },
  {
    id: "audit_governance",
    label: "Audit & Governance",
    icon: FileText,
    roles: ["Regulator"],
    ocid: "nav.audit_governance.link",
  },
  {
    id: "rating_engine",
    label: "Rating Engine",
    icon: Calculator,
    roles: ["Regulator", "Provider"],
    ocid: "nav.rating_engine.link",
  },
];

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentRole: AppRole;
}

export default function Sidebar({
  activePage,
  setActivePage,
  currentRole,
}: SidebarProps) {
  const visibleItems = navItems.filter((item) =>
    item.roles.includes(currentRole),
  );

  return (
    <aside
      className="flex flex-col border-r overflow-y-auto"
      style={{
        width: "210px",
        minWidth: "210px",
        background: "oklch(var(--sidebar))",
        borderColor: "oklch(var(--sidebar-border))",
      }}
      aria-label="Main navigation"
    >
      <div
        className="px-3 py-2 text-xs font-bold uppercase tracking-widest border-b"
        style={{
          color: "oklch(0.50 0.03 240)",
          borderColor: "oklch(var(--sidebar-border))",
        }}
      >
        Navigation
      </div>
      <nav className="flex-1 py-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setActivePage(item.id)}
              data-ocid={item.ocid}
              aria-label={item.labelOverride?.[currentRole] ?? item.label}
              aria-current={isActive ? "page" : undefined}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gov-gold"
              style={{
                background: isActive
                  ? "oklch(var(--sidebar-accent))"
                  : "transparent",
                color: isActive
                  ? "oklch(var(--sidebar-accent-foreground))"
                  : "oklch(0.70 0.03 240)",
                borderLeft: isActive
                  ? "3px solid oklch(var(--sidebar-primary))"
                  : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "oklch(0.27 0.07 254)";
                  e.currentTarget.style.color = "oklch(0.88 0.01 240)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "oklch(0.70 0.03 240)";
                }
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium leading-tight">
                {item.labelOverride?.[currentRole] ?? item.label}
              </span>
            </button>
          );
        })}
      </nav>
      <div
        className="px-3 py-2 text-xs border-t"
        style={{
          borderColor: "oklch(var(--sidebar-border))",
          color: "oklch(0.45 0.02 240)",
        }}
      >
        <div className="font-semibold mb-0.5">HRSM Module</div>
        <div>High-Risk Screening Mandates</div>
        <div
          className="mt-1.5 font-semibold"
          style={{ color: "oklch(0.55 0.10 145)" }}
        >
          ● Active
        </div>
      </div>
    </aside>
  );
}
