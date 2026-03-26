import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";
import type { AppRole } from "../App";

interface HeaderProps {
  currentRole: AppRole;
  setCurrentRole: (role: AppRole) => void;
  currentQuarter: string;
  setCurrentQuarter: (quarter: string) => void;
}

const roles: AppRole[] = ["Regulator", "Provider", "Policy Analyst", "Public"];
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

export default function Header({
  currentRole,
  setCurrentRole,
  currentQuarter,
  setCurrentQuarter,
}: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-5 flex-shrink-0"
      style={{
        background: "#ffffff",
        height: "64px",
        borderBottom: "1px solid #E5E7EB",
        boxShadow: "0 1px 4px rgba(30,58,138,0.06)",
        zIndex: 40,
      }}
    >
      {/* Left: Crest + Platform Identity */}
      <div className="flex items-center gap-0">
        {/* Government shield icon */}
        <div
          className="flex items-center justify-center w-9 h-9 rounded-sm flex-shrink-0 mr-3"
          style={{
            background: "oklch(0.94 0.018 258)",
            border: "1px solid oklch(0.86 0.03 258)",
          }}
        >
          <Shield className="w-5 h-5" style={{ color: "#1E3A8A" }} />
        </div>

        {/* Platform name block */}
        <div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "#1E3A8A",
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
              color: "#6B7280",
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

        {/* Dept label — desktop only */}
        <div
          className="hidden lg:block ml-5 pl-5"
          style={{ borderLeft: "1px solid #E5E7EB" }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Australian Government
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#9CA3AF",
              marginTop: "2px",
            }}
          >
            Department of Health & Aged Care
          </div>
        </div>
      </div>

      {/* Center: Quarter Selector */}
      <div className="hidden md:flex items-center gap-2">
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#6B7280",
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
              color: "#1E3A8A",
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

      {/* Right: Role Selector + Status */}
      <div className="flex items-center gap-2">
        {/* Mobile quarter */}
        <div className="flex md:hidden items-center">
          <Select value={currentQuarter} onValueChange={setCurrentQuarter}>
            <SelectTrigger
              className="h-8 w-[96px] text-xs font-semibold border"
              style={{
                background: "oklch(0.96 0.012 258)",
                color: "#1E3A8A",
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

        {/* Divider */}
        <div style={{ width: "1px", height: "28px", background: "#E5E7EB" }} />

        {/* Role label */}
        <span
          className="hidden sm:block"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#6B7280",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Role
        </span>
        <Select
          value={currentRole}
          onValueChange={(v) => setCurrentRole(v as AppRole)}
        >
          <SelectTrigger
            className="h-8 w-[130px] text-xs font-semibold border"
            style={{
              background: "#1E3A8A",
              color: "#ffffff",
              borderColor: "#1E3A8A",
              borderRadius: "4px",
            }}
            aria-label="Select user role"
            data-ocid="header.role_selector.select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r} value={r} className="text-xs">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Divider */}
        <div
          className="hidden md:block"
          style={{ width: "1px", height: "28px", background: "#E5E7EB" }}
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
