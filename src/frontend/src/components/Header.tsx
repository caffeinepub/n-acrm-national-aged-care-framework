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
const quarters = ["Q1-2025", "Q2-2025", "Q3-2025", "Q4-2025"];

export default function Header({
  currentRole,
  setCurrentRole,
  currentQuarter,
  setCurrentQuarter,
}: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-4 py-0 border-b border-gov-gold"
      style={{
        background: "oklch(var(--gov-navy-dark))",
        minHeight: "56px",
      }}
    >
      {/* Left: Crest + Title */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full border border-gov-gold bg-white overflow-hidden"
          aria-hidden="true"
        >
          <img
            src="/assets/generated/gov-crest-icon.dim_64x64.png"
            alt="Australian Government Crest"
            className="w-8 h-8 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const icon = document.createElement("div");
                icon.innerHTML = "🛡️";
                icon.style.fontSize = "16px";
                parent.appendChild(icon);
              }
            }}
          />
        </div>
        <div>
          <div
            className="font-bold text-sm leading-tight tracking-wide"
            style={{ color: "oklch(1 0 0)" }}
          >
            N-ACRM
          </div>
          <div
            className="text-xs leading-tight"
            style={{ color: "oklch(0.72 0.04 240)" }}
          >
            National Aged Care Reporting Framework
          </div>
        </div>
        <div
          className="hidden md:block ml-4 pl-4 border-l text-xs font-medium"
          style={{
            borderColor: "oklch(0.35 0.05 254)",
            color: "oklch(0.65 0.04 240)",
          }}
        >
          Australian Government · Department of Health & Aged Care
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium hidden sm:block"
            style={{ color: "oklch(0.65 0.04 240)" }}
          >
            Quarter:
          </span>
          <Select value={currentQuarter} onValueChange={setCurrentQuarter}>
            <SelectTrigger
              className="h-8 w-[110px] text-xs border-0 font-medium"
              style={{
                background: "oklch(0.26 0.08 254)",
                color: "oklch(0.92 0.01 240)",
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

        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium hidden sm:block"
            style={{ color: "oklch(0.65 0.04 240)" }}
          >
            Role:
          </span>
          <Select
            value={currentRole}
            onValueChange={(v) => setCurrentRole(v as AppRole)}
          >
            <SelectTrigger
              className="h-8 w-[130px] text-xs border-0 font-medium"
              style={{
                background: "oklch(0.26 0.08 254)",
                color: "oklch(0.92 0.01 240)",
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
        </div>

        <div
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
          style={{
            background: "oklch(0.26 0.08 254)",
            color: "oklch(0.80 0.13 85)",
          }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"
            aria-hidden="true"
          />
          <span>System Online</span>
        </div>
      </div>
    </header>
  );
}
