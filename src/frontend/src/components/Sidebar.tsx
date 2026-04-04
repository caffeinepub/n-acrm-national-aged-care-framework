import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Building2,
  Calculator,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Database,
  GitCompare,
  LayoutDashboard,
  MapPin,
  Search,
  Shield,
  Star,
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
        id: "regulator_intelligence",
        label: "Regulator Intelligence",
        icon: Brain,
        roles: ["Regulator"],
        ocid: "nav.regulator_intelligence.link",
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
      {
        id: "provider_comparison",
        label: "Provider Comparison",
        icon: GitCompare,
        roles: ["Regulator", "Policy Analyst", "Public"],
        ocid: "nav.provider_comparison.link",
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
        roles: ["Regulator", "Provider", "Policy Analyst"],
        ocid: "nav.audit_governance.link",
      },
    ],
  },
  {
    title: "AI TOOLS",
    items: [
      {
        id: "ai_assistant",
        label: "AI Assistant",
        icon: Bot,
        roles: ["Regulator", "Provider", "Policy Analyst", "Public"],
        ocid: "nav.ai_assistant.link",
      },
    ],
  },
  {
    title: "PUBLIC PORTAL",
    items: [
      {
        id: "national_overview",
        label: "Find Providers",
        icon: Search,
        roles: ["Public"],
        ocid: "nav.public.find",
      },
      {
        id: "public_bookings",
        label: "My Bookings",
        icon: CalendarDays,
        roles: ["Public"],
        ocid: "nav.public.bookings",
      },
      {
        id: "care_resources",
        label: "Care Resources",
        icon: BookOpen,
        roles: ["Public"],
        ocid: "nav.public.resources",
      },
      {
        id: "my_reviews",
        label: "My Reviews",
        icon: Star,
        roles: ["Public"],
        ocid: "nav.public.reviews",
      },
    ],
  },
];

function getRoleColor(role: AppRole): string {
  switch (role) {
    case "Regulator":
      return "var(--role-regulator)";
    case "Provider":
      return "var(--role-provider)";
    case "Policy Analyst":
      return "var(--role-analyst)";
    case "Public":
      return "var(--role-public)";
    default:
      return "oklch(0.74 0.14 86)";
  }
}

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentRole: AppRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  activePage,
  setActivePage,
  currentRole,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const roleColor = getRoleColor(currentRole);

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="flex flex-col overflow-y-auto flex-shrink-0"
        style={{
          width: collapsed ? "56px" : "240px",
          minWidth: collapsed ? "56px" : "240px",
          transition: "width 250ms ease, min-width 250ms ease",
          background: "var(--sidebar-gradient)",
          borderRight: "1px solid oklch(0.20 0.055 258)",
        }}
        aria-label="Main navigation"
      >
        {/* Logo / App Identity */}
        <div
          className="flex-shrink-0 overflow-hidden"
          style={{
            padding: collapsed ? "16px 10px" : "18px 16px 14px",
            borderBottom: "1px solid oklch(0.18 0.05 258)",
            background: "oklch(0.13 0.052 258 / 0.6)",
          }}
        >
          <div
            className="flex items-center"
            style={{ gap: collapsed ? "0" : "11px" }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, oklch(0.48 0.18 260), oklch(0.40 0.22 290))",
                boxShadow: "0 2px 8px oklch(0.30 0.18 265 / 0.5)",
                flexShrink: 0,
              }}
            >
              <Shield
                style={{ width: "17px", height: "17px", color: "#fff" }}
              />
            </div>

            {!collapsed && (
              <div className="overflow-hidden">
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "0.10em",
                    lineHeight: 1.1,
                    whiteSpace: "nowrap",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  N-ACRM
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "oklch(0.60 0.022 252)",
                    marginTop: "3px",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.04em",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Aged Care Intelligence
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <div
              style={{
                marginTop: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: "oklch(0.18 0.055 258 / 0.8)",
                border: "1px solid oklch(0.24 0.055 258)",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: roleColor,
                  boxShadow: `0 0 6px ${roleColor}`,
                }}
              />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "oklch(0.78 0.022 252)",
                  whiteSpace: "nowrap",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: "0.03em",
                }}
              >
                {currentRole}
              </span>
            </div>
          )}

          {collapsed && (
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: roleColor,
                  boxShadow: `0 0 6px ${roleColor}`,
                }}
              />
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ paddingTop: "6px", paddingBottom: "6px" }}
        >
          {NAV_GROUPS.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) =>
              item.roles.includes(currentRole),
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title}>
                {!collapsed && (
                  <div
                    className="sidebar-group-label"
                    style={{
                      marginTop: groupIdx === 0 ? "4px" : "8px",
                      borderTop:
                        groupIdx > 0
                          ? "1px solid oklch(0.18 0.048 258)"
                          : "none",
                      paddingTop: groupIdx > 0 ? "12px" : "6px",
                    }}
                  >
                    {group.title}
                  </div>
                )}

                {collapsed && groupIdx > 0 && (
                  <div
                    style={{
                      height: "1px",
                      margin: "6px 10px",
                      background: "oklch(0.18 0.048 258)",
                    }}
                    aria-hidden="true"
                  />
                )}

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  const label = item.labelOverride?.[currentRole] ?? item.label;

                  const button = (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setActivePage(item.id)}
                      data-ocid={item.ocid}
                      aria-label={label}
                      aria-current={isActive ? "page" : undefined}
                      className={`sidebar-nav-item${isActive ? " active" : ""}`}
                      style={{
                        justifyContent: collapsed ? "center" : "flex-start",
                        margin: collapsed ? "1px auto" : undefined,
                        width: collapsed ? "40px" : undefined,
                        padding: collapsed ? "9px 0" : undefined,
                        borderRadius: collapsed ? "8px" : undefined,
                        borderLeft: collapsed ? "none" : undefined,
                      }}
                    >
                      <Icon
                        className="sidebar-icon"
                        style={{
                          color: isActive ? "oklch(0.74 0.14 86)" : "inherit",
                        }}
                      />
                      {!collapsed && (
                        <span
                          style={{
                            fontSize: "12.5px",
                            fontWeight: 500,
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          {label}
                        </span>
                      )}
                    </button>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={`${item.id}-${item.ocid}`}>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return <div key={`${item.id}-${item.ocid}`}>{button}</div>;
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer + Collapse Toggle */}
        <div
          className="flex-shrink-0"
          style={{
            borderTop: "1px solid oklch(0.18 0.048 258)",
            background: "oklch(0.12 0.048 258 / 0.6)",
          }}
        >
          {!collapsed && (
            <div style={{ padding: "10px 16px 6px" }}>
              <div
                style={{
                  fontSize: "10.5px",
                  color: "oklch(0.44 0.025 252)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Version 24 · Q4-2025
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "oklch(0.36 0.02 252)",
                  marginTop: "2px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Privacy Act 1988 Compliance
              </div>
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onToggleCollapse}
                data-ocid="sidebar.toggle"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="sidebar-collapse-btn"
              >
                {collapsed ? (
                  <ChevronRight style={{ width: "14px", height: "14px" }} />
                ) : (
                  <ChevronLeft style={{ width: "14px", height: "14px" }} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
