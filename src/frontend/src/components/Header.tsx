import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Building2,
  ChevronDown,
  Home,
  Shield,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AppRole } from "../App";

interface HeaderProps {
  currentRole: AppRole;
  currentQuarter: string;
  setCurrentQuarter: (quarter: string) => void;
  onRoleSwitch: (role: AppRole) => void;
  onGoHome: () => void;
}

const quarters = [
  "Q1-2024",
  "Q2-2024",
  "Q3-2024",
  "Q4-2024",
  "Q1-2025",
  "Q2-2025",
  "Q3-2025",
  "Q4-2025",
];

const ALL_ROLES: AppRole[] = [
  "Regulator",
  "Provider",
  "Policy Analyst",
  "Public",
];

const ROLE_STYLES: Record<
  AppRole,
  { bg: string; border: string; color: string; icon: React.ElementType }
> = {
  Regulator: {
    bg: "rgba(37,99,235,0.15)",
    border: "rgba(37,99,235,0.4)",
    color: "#3b82f6",
    icon: Shield,
  },
  Provider: {
    bg: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.4)",
    color: "#10b981",
    icon: Building2,
  },
  "Policy Analyst": {
    bg: "rgba(124,58,237,0.15)",
    border: "rgba(124,58,237,0.4)",
    color: "#7c3aed",
    icon: BarChart3,
  },
  Public: {
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.4)",
    color: "#f59e0b",
    icon: Users,
  },
};

export default function Header({
  currentRole,
  currentQuarter,
  setCurrentQuarter,
  onRoleSwitch,
  onGoHome,
}: HeaderProps) {
  const roleStyle = ROLE_STYLES[currentRole];
  const RoleIcon = roleStyle.icon;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleSelect = (role: AppRole) => {
    onRoleSwitch(role);
    setDropdownOpen(false);
  };

  return (
    <header
      className="flex items-center justify-between px-5 flex-shrink-0"
      style={{
        background: "oklch(1.0 0.0 0)",
        height: "64px",
        borderBottom: "1px solid oklch(0.90 0.008 252)",
        boxShadow: "0 1px 4px oklch(0.22 0.07 258 / 0.06)",
        zIndex: 40,
      }}
    >
      {/* Left: Home button + Crest + Platform Identity */}
      <div className="flex items-center gap-3">
        {/* Home button */}
        <button
          type="button"
          onClick={onGoHome}
          data-ocid="header.home.button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "oklch(0.50 0.022 252)",
            border: "1px solid oklch(0.90 0.008 252)",
            background: "transparent",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.96 0.012 258)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
        >
          <Home size={11} />
          <span className="hidden sm:inline">Home</span>
        </button>

        <div className="flex items-center gap-0">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-sm flex-shrink-0 mr-3"
            style={{
              background: "oklch(0.94 0.018 258)",
              border: "1px solid oklch(0.86 0.03 258)",
            }}
          >
            <Shield
              className="w-5 h-5"
              style={{ color: "oklch(0.22 0.07 258)" }}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "oklch(0.22 0.07 258)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                lineHeight: 1,
                letterSpacing: "0.02em",
              }}
            >
              N-ACRM
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "oklch(0.50 0.022 252)",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: 1,
                marginTop: "3px",
              }}
            >
              National Aged Care Intelligence Platform
            </div>
          </div>

          <div
            className="hidden lg:block ml-5 pl-5"
            style={{ borderLeft: "1px solid oklch(0.90 0.008 252)" }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "oklch(0.32 0.028 252)",
              }}
            >
              Australian Government
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "oklch(0.62 0.015 252)",
                marginTop: "2px",
              }}
            >
              Department of Health &amp; Aged Care
            </div>
          </div>
        </div>
      </div>

      {/* Center: Quarter Selector */}
      <div className="hidden md:flex items-center gap-2">
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "oklch(0.50 0.022 252)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Reporting Period
        </span>
        <Select value={currentQuarter} onValueChange={setCurrentQuarter}>
          <SelectTrigger
            className="h-8 w-[110px] text-xs font-semibold border"
            style={{
              background: "oklch(0.96 0.012 258)",
              color: "oklch(0.22 0.07 258)",
              borderColor: "oklch(0.86 0.03 258)",
              borderRadius: "4px",
            }}
            aria-label="Select reporting quarter"
            data-ocid="header.quarter_selector.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {quarters.map((q) => (
              <SelectItem key={q} value={q} className="text-xs">
                {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right: Role Switcher + Status */}
      <div className="flex items-center gap-3">
        {/* Mobile quarter */}
        <div className="flex md:hidden items-center">
          <Select value={currentQuarter} onValueChange={setCurrentQuarter}>
            <SelectTrigger
              className="h-8 w-[96px] text-xs font-semibold border"
              style={{
                background: "oklch(0.96 0.012 258)",
                color: "oklch(0.22 0.07 258)",
                borderColor: "oklch(0.86 0.03 258)",
                borderRadius: "4px",
              }}
              data-ocid="header.quarter_selector_mobile.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quarters.map((q) => (
                <SelectItem key={q} value={q} className="text-xs">
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          style={{
            width: "1px",
            height: "28px",
            background: "oklch(0.90 0.008 252)",
          }}
        />

        {/* Role switcher dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            type="button"
            data-ocid="header.role_switcher.button"
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "20px",
              background: roleStyle.bg,
              border: `1px solid ${roleStyle.border}`,
              fontSize: "12px",
              fontWeight: 700,
              color: "oklch(0.22 0.07 258)",
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
          >
            <RoleIcon
              size={13}
              style={{ flexShrink: 0, color: roleStyle.color }}
            />
            {currentRole}
            <ChevronDown
              size={11}
              style={{
                flexShrink: 0,
                transition: "transform 0.2s",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                color: "oklch(0.50 0.022 252)",
              }}
            />
          </button>

          {dropdownOpen && (
            <div
              data-ocid="header.role_switcher.dropdown_menu"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                minWidth: "180px",
                background: "oklch(1.0 0.0 0)",
                border: "1px solid oklch(0.90 0.008 252)",
                borderRadius: "10px",
                boxShadow: "0 8px 24px oklch(0.22 0.07 258 / 0.12)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "6px 12px 4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "oklch(0.60 0.022 252)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  borderBottom: "1px solid oklch(0.94 0.008 252)",
                  marginBottom: "4px",
                }}
              >
                Switch Role
              </div>
              {ALL_ROLES.map((role) => {
                const rs = ROLE_STYLES[role];
                const Icon = rs.icon;
                const isActive = role === currentRole;
                return (
                  <button
                    key={role}
                    type="button"
                    data-ocid={`header.role_option.${role.toLowerCase().replace(" ", "_")}.button`}
                    onClick={() => handleRoleSelect(role)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "8px 12px",
                      background: isActive ? rs.bg : "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? "oklch(0.22 0.07 258)"
                        : "oklch(0.36 0.022 252)",
                      transition: "background 0.12s",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "oklch(0.97 0.008 252)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        isActive ? rs.bg : "transparent";
                    }}
                  >
                    <Icon
                      size={13}
                      style={{ color: rs.color, flexShrink: 0 }}
                    />
                    {role}
                    {isActive && (
                      <span
                        style={{
                          marginLeft: "auto",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: rs.color,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="hidden md:block"
          style={{
            width: "1px",
            height: "28px",
            background: "oklch(0.90 0.008 252)",
          }}
        />

        {/* System Status */}
        <div
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold"
          style={{
            background: "#F0FDF4",
            color: "#15803D",
            border: "1px solid #BBF7D0",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          System Operational
        </div>
      </div>
    </header>
  );
}
