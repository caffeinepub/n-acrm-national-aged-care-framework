import {
  BarChart3,
  Building2,
  ChevronDown,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AppRole } from "../../App";

interface HomePageProps {
  onRoleSelect: (role: AppRole) => void;
}

const ROLES: {
  role: AppRole;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  glow: string;
  accent: string;
}[] = [
  {
    role: "Regulator",
    icon: Shield,
    title: "Regulator",
    description:
      "National command center — monitor all providers, manage risk, and drive compliance across Australia.",
    gradient:
      "linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(29,78,216,0.15) 100%)",
    glow: "rgba(37,99,235,0.35)",
    accent: "#3b82f6",
  },
  {
    role: "Provider",
    icon: Building2,
    title: "Provider",
    description:
      "Manage your facility performance, indicators, and improvement programs in real time.",
    gradient:
      "linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(5,150,105,0.15) 100%)",
    glow: "rgba(16,185,129,0.35)",
    accent: "#10b981",
  },
  {
    role: "Policy Analyst",
    icon: BarChart3,
    title: "Policy Analyst",
    description:
      "Advanced analytics, scenario modelling, equity insights and national intelligence center.",
    gradient:
      "linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(109,40,217,0.15) 100%)",
    glow: "rgba(124,58,237,0.35)",
    accent: "#7c3aed",
  },
  {
    role: "Public",
    icon: Users,
    title: "Public",
    description:
      "Find aged care providers, book services, read resources, and share your experience.",
    gradient:
      "linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(217,119,6,0.15) 100%)",
    glow: "rgba(245,158,11,0.35)",
    accent: "#f59e0b",
  },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Radar charts, heatmaps, trend graphs, and risk distribution across Australia's 2,700+ aged care services.",
    accent: "#3b82f6",
  },
  {
    icon: Zap,
    title: "Risk Prediction Engine",
    description:
      "AI-powered risk prediction flags providers at risk before issues escalate, with confidence scores and explanations.",
    accent: "#f59e0b",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Sync",
    description:
      "Any change to indicator data instantly propagates through the rating engine, eligibility logic, and all dashboards.",
    accent: "#10b981",
  },
];

const STATS = [
  { value: "2,700+", label: "Aged Care Services" },
  { value: "10,000+", label: "Concurrent Users" },
  { value: "4 Roles", label: "Access Levels" },
  { value: "99.5%", label: "Platform Uptime" },
];

function useIntersectionObserver(
  ref: React.RefObject<Element | null>,
  options?: IntersectionObserverInit,
) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15, ...options },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, options]);
  return isVisible;
}

function AnimatedSection({
  children,
  delay = 0,
}: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersectionObserver(ref as React.RefObject<Element>);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage({ onRoleSelect }: HomePageProps) {
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [hoveredRole, setHoveredRole] = useState<AppRole | null>(null);

  const handleRoleClick = (role: AppRole) => {
    if (transitioning) return;
    setSelectedRole(role);
    setTransitioning(true);
    setTimeout(() => onRoleSelect(role), 420);
  };

  const scrollToRoles = () => {
    document
      .getElementById("roles-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToFeatures = () => {
    document
      .getElementById("features-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #0a0f1e 0%, #0d1540 55%, #0a1628 100%)",
        minHeight: "100vh",
        overflowX: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        opacity: transitioning ? 0 : 1,
        transition: "opacity 0.42s ease",
      }}
    >
      {/* Dot-grid overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Fixed nav */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          height: "60px",
          background: "rgba(10,15,30,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #3b82f6, #6d28d9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={16} color="#fff" />
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "0.08em",
            }}
          >
            N-ACRM
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 500,
              letterSpacing: "0.05em",
              marginLeft: "4px",
            }}
            className="hidden sm:inline"
          >
            National Aged Care Intelligence Platform
          </span>
        </div>
        <button
          type="button"
          onClick={scrollToRoles}
          data-ocid="home.enter_dashboard.button"
          style={{
            padding: "8px 20px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #3b82f6, #6d28d9)",
            border: "none",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.03em",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
          }}
        >
          Enter Dashboard →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          padding: "80px 24px 60px",
          textAlign: "center",
        }}
      >
        {/* Animated glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "8%",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
            animation: "pulse 5s ease-in-out 1s infinite",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "20px",
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.3)",
            marginBottom: "32px",
            animation: "fadeSlideUp 0.8s ease",
          }}
        >
          <Sparkles size={13} color="#fbbf24" />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.08em",
            }}
          >
            AUSTRALIAN GOVERNMENT · DEPARTMENT OF HEALTH &amp; AGED CARE
          </span>
        </div>

        {/* Main heading */}
        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "20px",
            maxWidth: "900px",
            animation: "fadeSlideUp 0.9s ease 0.1s both",
          }}
        >
          Transforming Aged Care
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #3b82f6 0%, #a78bfa 50%, #fbbf24 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Intelligence
          </span>
        </h1>

        <p
          style={{
            fontSize: "clamp(14px, 2vw, 18px)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.7,
            maxWidth: "600px",
            marginBottom: "40px",
            animation: "fadeSlideUp 1s ease 0.2s both",
          }}
        >
          A national, enterprise-grade analytics and prevention platform
          supporting 2,700+ aged care services across Australia — from reactive
          reporting to proactive, data-driven improvement.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: "64px",
            animation: "fadeSlideUp 1s ease 0.3s both",
          }}
        >
          <button
            type="button"
            onClick={scrollToRoles}
            data-ocid="home.hero.select_role.button"
            style={{
              padding: "13px 32px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #3b82f6, #6d28d9)",
              border: "none",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(59,130,246,0.4)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 8px 32px rgba(59,130,246,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 24px rgba(59,130,246,0.4)";
            }}
          >
            Select Your Role
          </button>
          <button
            type="button"
            onClick={scrollToFeatures}
            data-ocid="home.hero.learn_more.button"
            style={{
              padding: "13px 32px",
              borderRadius: "24px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.8)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.06)";
            }}
          >
            Learn More
          </button>
        </div>

        {/* Mini role chips */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fadeSlideUp 1s ease 0.4s both",
          }}
        >
          {ROLES.map(({ role, icon: Icon, accent }) => (
            <div
              key={role}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 14px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${accent}40`,
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <Icon size={11} style={{ color: accent }} />
              {role}
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            opacity: 0.4,
            animation: "bounce 2s ease-in-out infinite",
          }}
        >
          <span
            style={{ fontSize: "10px", color: "#fff", letterSpacing: "0.08em" }}
          >
            SCROLL
          </span>
          <ChevronDown size={14} color="#fff" />
        </div>
      </section>

      {/* ── ROLE SELECTION ── */}
      <section
        id="roles-section"
        style={{
          padding: "80px 24px",
          maxWidth: "1100px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatedSection>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Access Control
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
              }}
            >
              Choose Your Access Level
            </h2>
            <p
              style={{
                marginTop: "12px",
                color: "rgba(255,255,255,0.45)",
                fontSize: "15px",
                maxWidth: "480px",
                margin: "12px auto 0",
              }}
            >
              Each role provides a tailored view of Australia's aged care
              intelligence platform.
            </p>
          </div>
        </AnimatedSection>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {ROLES.map(
            (
              { role, icon: Icon, title, description, gradient, glow, accent },
              idx,
            ) => {
              const isSelected = selectedRole === role;
              const isHovered = hoveredRole === role;
              return (
                <AnimatedSection key={role} delay={idx * 80}>
                  <button
                    type="button"
                    data-ocid={`home.role_card.${role.toLowerCase().replace(" ", "_")}.button`}
                    onClick={() => handleRoleClick(role)}
                    onMouseEnter={() => setHoveredRole(role)}
                    onMouseLeave={() => setHoveredRole(null)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "28px 24px",
                      borderRadius: "20px",
                      background: gradient,
                      border: `1px solid ${isHovered || isSelected ? `${accent}60` : "rgba(255,255,255,0.08)"}`,
                      cursor: "pointer",
                      backdropFilter: "blur(12px)",
                      boxShadow:
                        isHovered || isSelected
                          ? `0 8px 40px ${glow}`
                          : "0 2px 12px rgba(0,0,0,0.3)",
                      transform: isHovered
                        ? "translateY(-6px) scale(1.02)"
                        : "translateY(0) scale(1)",
                      transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                      outline: "none",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Glow line at top */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "20%",
                        right: "20%",
                        height: "2px",
                        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                        opacity: isHovered ? 1 : 0.4,
                        transition: "opacity 0.25s",
                      }}
                    />
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: `${accent}20`,
                        border: `1px solid ${accent}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                        boxShadow: isHovered
                          ? `0 4px 16px ${accent}40`
                          : "none",
                        transition: "box-shadow 0.25s",
                      }}
                    >
                      <Icon size={22} style={{ color: accent }} />
                    </div>
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: 800,
                        color: "#fff",
                        marginBottom: "8px",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        fontSize: "12.5px",
                        color: "rgba(255,255,255,0.55)",
                        lineHeight: 1.6,
                      }}
                    >
                      {description}
                    </div>
                    <div
                      style={{
                        marginTop: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: accent,
                        letterSpacing: "0.04em",
                      }}
                    >
                      Enter Dashboard →
                    </div>
                  </button>
                </AnimatedSection>
              );
            },
          )}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features-section"
        style={{
          padding: "80px 24px",
          maxWidth: "1100px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatedSection>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Capabilities
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.01em",
              }}
            >
              Platform Capabilities
            </h2>
          </div>
        </AnimatedSection>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {FEATURES.map(({ icon: Icon, title, description, accent }, idx) => (
            <AnimatedSection key={title} delay={idx * 100}>
              <div
                style={{
                  padding: "28px 24px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(8px)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    `0 8px 32px ${accent}20`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: `${accent}18`,
                    border: `1px solid ${accent}35`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Icon size={20} style={{ color: accent }} />
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: "8px",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.65,
                  }}
                >
                  {description}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        style={{
          padding: "60px 24px",
          position: "relative",
          zIndex: 1,
          background: "rgba(255,255,255,0.02)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <AnimatedSection>
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "32px",
              textAlign: "center",
            }}
          >
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "clamp(28px, 4vw, 42px)",
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    background:
                      "linear-gradient(135deg, #fff, rgba(255,255,255,0.6))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          padding: "40px 24px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <Shield size={14} color="rgba(255,255,255,0.3)" />
          <span
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.35)",
              fontWeight: 600,
            }}
          >
            Australian Government · Department of Health &amp; Aged Care
          </span>
        </div>
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.22)",
            margin: "4px 0",
          }}
        >
          Privacy Act 1988 Compliance · N-ACRM v24 · All data is protected under
          Australian Government security standards
        </p>
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.18)",
            margin: "8px 0 0",
          }}
        >
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "rgba(255,255,255,0.3)",
              textDecoration: "underline",
            }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </div>
  );
}
