import { ArrowRight, BarChart3, Building2, Shield, Users } from "lucide-react";
import { useRef, useState } from "react";
import type { AppRole } from "../App";

interface RoleSelectionDashboardProps {
  onRoleSelect: (role: AppRole) => void;
}

const ROLES: {
  role: AppRole;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  glowColor: string;
  accentColor: string;
  borderAccent: string;
}[] = [
  {
    role: "Regulator",
    icon: Shield,
    title: "Regulator",
    description:
      "National oversight & compliance monitoring across all aged care providers",
    gradient: "linear-gradient(135deg, #2563eb, #4338ca)",
    glowColor: "rgba(99, 102, 241, 0.35)",
    accentColor: "#818cf8",
    borderAccent: "linear-gradient(90deg, #2563eb, #4338ca)",
  },
  {
    role: "Provider",
    icon: Building2,
    title: "Provider",
    description:
      "Manage facility performance, indicators, and quality improvements",
    gradient: "linear-gradient(135deg, #10b981, #0d9488)",
    glowColor: "rgba(16, 185, 129, 0.35)",
    accentColor: "#34d399",
    borderAccent: "linear-gradient(90deg, #10b981, #0d9488)",
  },
  {
    role: "Policy Analyst",
    icon: BarChart3,
    title: "Policy Analyst",
    description:
      "Advanced analytics, equity insights, and policy impact intelligence",
    gradient: "linear-gradient(135deg, #7c3aed, #9333ea)",
    glowColor: "rgba(139, 92, 246, 0.35)",
    accentColor: "#a78bfa",
    borderAccent: "linear-gradient(90deg, #7c3aed, #9333ea)",
  },
  {
    role: "Public",
    icon: Users,
    title: "Public",
    description: "Find and compare aged care providers in your region",
    gradient: "linear-gradient(135deg, #f59e0b, #ea580c)",
    glowColor: "rgba(245, 158, 11, 0.35)",
    accentColor: "#fbbf24",
    borderAccent: "linear-gradient(90deg, #f59e0b, #ea580c)",
  },
];

function RippleEffect({ x, y }: { x: number; y: number }) {
  return (
    <span
      style={{
        position: "absolute",
        left: x - 10,
        top: y - 10,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.3)",
        transform: "scale(0)",
        animation: "rippleExpand 600ms ease-out forwards",
        pointerEvents: "none",
      }}
    />
  );
}

function RoleCard({
  config,
  index,
  onSelect,
}: {
  config: (typeof ROLES)[0];
  index: number;
  onSelect: (role: AppRole) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const Icon = config.icon;

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setTimeout(() => setRipple(null), 700);
    }
  };

  const animationDelay = `${index * 100}ms`;

  return (
    <button
      ref={cardRef}
      type="button"
      data-ocid={`role_selection.${config.role.toLowerCase().replace(" ", "_")}.button`}
      onClick={() => onSelect(config.role)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={handleMouseDown}
      style={{
        position: "relative",
        textAlign: "left",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: hovered
          ? "1px solid rgba(255,255,255,0.30)"
          : "1px solid rgba(255,255,255,0.12)",
        borderRadius: "20px",
        padding: "36px",
        cursor: "pointer",
        overflow: "hidden",
        width: "100%",
        transition:
          "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        transform: hovered
          ? "scale(1.04) translateY(-4px)"
          : "scale(1) translateY(0)",
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${config.glowColor}`
          : "0 4px 24px rgba(0,0,0,0.2)",
        animation: "slideUp 0.6s ease forwards",
        animationDelay,
        opacity: 0,
      }}
    >
      {/* Ripple */}
      {ripple && <RippleEffect x={ripple.x} y={ripple.y} />}

      {/* Icon */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "16px",
          background: config.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          boxShadow: `0 8px 24px ${config.glowColor}`,
        }}
      >
        <Icon size={28} color="white" strokeWidth={1.8} />
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "rgba(255,255,255,0.95)",
          marginBottom: "10px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: "-0.01em",
        }}
      >
        {config.title}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.62)",
          lineHeight: 1.6,
          marginBottom: "20px",
        }}
      >
        {config.description}
      </div>

      {/* Enter Dashboard CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          fontWeight: 600,
          color: config.accentColor,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-8px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        Enter Dashboard
        <ArrowRight size={14} />
      </div>

      {/* Bottom accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: config.borderAccent,
          borderRadius: "0 0 20px 20px",
          opacity: hovered ? 1 : 0.5,
          transition: "opacity 0.25s ease",
        }}
      />
    </button>
  );
}

export default function RoleSelectionDashboard({
  onRoleSelect,
}: RoleSelectionDashboardProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleRoleSelect = (role: AppRole) => {
    setIsExiting(true);
    setTimeout(() => {
      onRoleSelect(role);
    }, 400);
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-22px) scale(1.04); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-18px) scale(1.03); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-14px) scale(1.02); }
        }
        @keyframes rippleExpand {
          from { transform: scale(0); opacity: 1; }
          to { transform: scale(20); opacity: 0; }
        }
        @keyframes dashboardExit {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.97); }
        }
        .role-selection-root {
          animation: none;
        }
        .role-selection-root.exiting {
          animation: dashboardExit 0.4s ease forwards;
        }
        @media (max-width: 640px) {
          .role-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        className={`role-selection-root${isExiting ? " exiting" : ""}`}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0a0f1e 0%, #0d1540 55%, #0a1628 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          zIndex: 9999,
        }}
      >
        {/* Dot-grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E\")",
            backgroundSize: "24px 24px",
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />

        {/* Glow blob — top-left */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)",
            animation: "floatA 8s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        {/* Glow blob — center-right */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "-80px",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
            animation: "floatB 10s ease-in-out infinite",
            animationDelay: "2s",
            pointerEvents: "none",
          }}
        />
        {/* Glow blob — bottom-center */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)",
            animation: "floatC 12s ease-in-out infinite",
            animationDelay: "4s",
            pointerEvents: "none",
          }}
        />

        {/* Content container */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 960,
            padding: "0 24px",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "52px",
              animation: "fadeInDown 0.7s ease forwards",
            }}
          >
            {/* Crest */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 60,
                height: 60,
                borderRadius: "16px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                marginBottom: "20px",
              }}
            >
              <Shield size={28} color="#fbbf24" strokeWidth={1.8} />
            </div>

            <div
              style={{
                fontSize: "clamp(36px, 5vw, 52px)",
                fontWeight: 800,
                color: "rgba(255,255,255,0.97)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                marginBottom: "12px",
              }}
            >
              N-ACRM
            </div>
            <div
              style={{
                fontSize: "clamp(13px, 2vw, 16px)",
                color: "rgba(255,255,255,0.55)",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              National Aged Care Reporting &amp; Prevention Framework
            </div>
            <div
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.40)",
                fontWeight: 400,
              }}
            >
              Select your role to access your personalized dashboard
            </div>
          </div>

          {/* Cards grid */}
          <div
            className="role-cards-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
            }}
          >
            {ROLES.map((config, i) => (
              <RoleCard
                key={config.role}
                config={config}
                index={i}
                onSelect={handleRoleSelect}
              />
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              marginTop: "40px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.25)",
              animation: "fadeInDown 0.9s ease forwards",
              animationDelay: "500ms",
              opacity: 0,
            }}
          >
            Australian Government · Department of Health &amp; Aged Care ·
            Secure Platform
          </div>
        </div>
      </div>
    </>
  );
}
