import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calculator,
  ClipboardCheck,
  Database,
  FileText,
  LayoutDashboard,
  MapPin,
  Shield,
  TrendingUp,
} from "lucide-react";
import type { ActivePage, AppRole } from "../App";

interface NavItem {
  id: ActivePage;
  label: string;
  labelOverride?: Partial<Record<AppRole, string>>;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  roles: AppRole[];
  ocid: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "INTELLIGENCE",
    items: [
      {
        id: "national_overview",
        label: "National Overview",
        labelOverride: { Provider: "My Dashboard" },
        icon: LayoutDashboard,
        roles: ["Regulator", "Provider", "Policy Analyst"],
        ocid: "nav.national_overview.link",
      },
      {
        id: "regional_provider",
        label: "Regional Provider Lookup",
        icon: MapPin,
        roles: ["Regulator", "Policy Analyst"],
        ocid: "nav.regional_provider.link",
      },
    ],
  },
  {
    title: "PROVIDER MANAGEMENT",
    items: [
      {
        id: "provider_performance",
        label: "Provider Dashboard",
        icon: Building2,
        roles: ["Regulator", "Policy Analyst"],
        ocid: "nav.provider_performance.link",
      },
      {
        id: "high_risk_cohorts",
        label: "High-Risk Cohort Monitoring",
        icon: AlertTriangle,
        roles: ["Regulator"],
        ocid: "nav.high_risk_cohorts.link",
      },
      {
        id: "screening_tracking",
        label: "Screening Bundle Tracking",
        icon: ClipboardCheck,
        roles: ["Regulator"],
        ocid: "nav.screening_tracking.link",
      },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      {
        id: "policy_analytics",
        label: "Policy Analytics",
        icon: BarChart3,
        roles: ["Regulator", "Policy Analyst"],
        ocid: "nav.policy_analytics.link",
      },
      {
        id: "pay_for_improvement",
        label: "Pay-for-Improvement",
        icon: TrendingUp,
        roles: ["Regulator", "Provider", "Policy Analyst"],
        ocid: "nav.pay_for_improvement.link",
      },
      {
        id: "rating_engine",
        label: "Rating Engine",
        icon: Calculator,
        roles: ["Regulator", "Provider"],
        ocid: "nav.rating_engine.link",
      },
    ],
  },
  {
    title: "GOVERNANCE",
    items: [
      {
        id: "data_quality",
        label: "Data Quality",
        icon: Database,
        roles: ["Regulator", "Provider"],
        ocid: "nav.data_quality.link",
      },
      {
        id: "audit_governance",
        label: "Audit & Governance",
        icon: Shield,
        roles: ["Regulator"],
        ocid: "nav.audit_governance.link",
      },
    ],
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
  return (
    <aside
      className="flex flex-col border-r overflow-y-auto flex-shrink-0"
      style={{
        width: "220px",
        minWidth: "220px",
        background: "oklch(var(--sidebar))",
        borderColor: "oklch(var(--sidebar-border))",
      }}
      aria-label="Main navigation"
    >
      {/* App identity block */}
      <div
        className="px-4 py-4 border-b flex-shrink-0"
        style={{
          borderBottomColor: "oklch(var(--sidebar-border))",
          background: "oklch(0.13 0.052 258)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
            style={{
              background: "oklch(var(--gov-gold))",
              color: "oklch(0.14 0.055 258)",
            }}
          >
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div>
            <div
              className="text-sm font-extrabold uppercase tracking-widest leading-none"
              style={{ color: "#fff", letterSpacing: "0.10em" }}
            >
              N-ACRM
            </div>
            <div
              className="text-xs leading-snug mt-0.5"
              style={{ color: "oklch(0.68 0.022 252)", fontSize: "0.65rem" }}
            >
              Aged Care Intelligence
            </div>
          </div>
        </div>

        {/* Role pill */}
        <div
          className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-xs font-semibold"
          style={{
            background: "oklch(0.22 0.065 258)",
            color: "oklch(0.74 0.028 252)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "oklch(var(--gov-gold))" }}
          />
          {currentRole}
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 py-1 overflow-y-auto">
        {NAV_GROUPS.map((group, groupIdx) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(currentRole),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title}>
              {/* Group label */}
              <div
                className="px-4 flex items-center gap-2"
                style={{
                  paddingTop: groupIdx === 0 ? "10px" : "11px",
                  paddingBottom: "5px",
                  borderTop:
                    groupIdx > 0 ? "1px solid oklch(0.22 0.052 258)" : "none",
                  marginTop: groupIdx > 0 ? "4px" : "0",
                }}
              >
                <span
                  className="text-xs font-bold uppercase"
                  style={{
                    color: "oklch(0.62 0.040 255)",
                    letterSpacing: "0.08em",
                    fontSize: "0.64rem",
                  }}
                >
                  {group.title}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "oklch(0.22 0.052 258)" }}
                  aria-hidden="true"
                />
              </div>

              {/* Nav items */}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                const label = item.labelOverride?.[currentRole] ?? item.label;

                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    data-ocid={item.ocid}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors duration-100 focus-visible:outline-none"
                    style={{
                      background: isActive
                        ? "oklch(0.22 0.085 258)"
                        : "transparent",
                      color: isActive
                        ? "oklch(0.96 0.008 252)"
                        : "oklch(0.58 0.025 252)",
                      borderLeft: isActive
                        ? "2px solid oklch(var(--gov-gold))"
                        : "2px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "oklch(0.20 0.065 258)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "oklch(0.82 0.015 252)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "oklch(0.58 0.025 252)";
                      }
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{
                        color: isActive ? "oklch(var(--gov-gold))" : "inherit",
                        opacity: isActive ? 1 : 0.65,
                      }}
                    />
                    <span className="text-xs font-medium leading-snug">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t flex-shrink-0"
        style={{
          borderColor: "oklch(0.22 0.052 258)",
          background: "oklch(0.13 0.052 258)",
        }}
      >
        <div className="text-xs" style={{ color: "oklch(0.46 0.028 252)" }}>
          Version 24 · Q4-2025
        </div>
        <div
          className="text-xs mt-0.5"
          style={{ color: "oklch(0.36 0.022 252)", fontSize: "0.65rem" }}
        >
          Privacy Act 1988 Compliance
        </div>
      </div>
    </aside>
  );
}
