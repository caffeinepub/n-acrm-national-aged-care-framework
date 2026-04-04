import { DSCard } from "@/components/ds";
import { Input } from "@/components/ui/input";
import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AppRole } from "../../App";
import {
  PROVIDER_MASTER,
  getProviderRatingForQuarter,
} from "../../data/mockData";

interface AIAssistantProps {
  currentRole: AppRole;
  currentQuarter: string;
}

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const ROLE_QUERIES: Record<AppRole, string[]> = {
  Regulator: [
    "Show high-risk providers",
    "Which providers need auditing?",
    "Compare Q1 vs Q4 performance",
    "Providers below benchmark",
  ],
  Provider: [
    "How can I improve my rating?",
    "What are my weakest indicators?",
    "Am I eligible for Pay-for-Improvement?",
    "How do I compare to benchmarks?",
  ],
  "Policy Analyst": [
    "Which regions have equity gaps?",
    "Show national screening trends",
    "Policy impact summary",
    "Top performing states",
  ],
  Public: [
    "Best provider near me",
    "Which provider is safest?",
    "Best for dementia care",
    "Show available bookings",
  ],
};

const ROLE_SUBTITLES: Record<AppRole, string> = {
  Regulator:
    "National regulatory intelligence — ask about provider performance, risk, and compliance",
  Provider:
    "Your personal performance advisor — ask about ratings, indicators, and improvement",
  "Policy Analyst":
    "Policy intelligence engine — ask about trends, equity gaps, and regional insights",
  Public:
    "Your care guide — ask about providers, safety, services, and bookings",
};

function calcRiskFromStars(stars: number): "Low" | "Medium" | "High" {
  if (stars < 2.5) return "High";
  if (stars < 3.5) return "Medium";
  return "Low";
}

function generateResponse(
  query: string,
  _role: AppRole,
  quarter: string,
): string {
  const q = query.toLowerCase();
  const allProviders = PROVIDER_MASTER;

  // High risk
  if (
    q.includes("high-risk") ||
    q.includes("high risk") ||
    q.includes("risk")
  ) {
    const highRisk = allProviders
      .map((p) => ({ p, r: getProviderRatingForQuarter(p.id, quarter) }))
      .filter((x) => calcRiskFromStars(x.r.stars) === "High")
      .slice(0, 5);
    if (highRisk.length === 0)
      return `✅ Great news! No providers are currently classified as High Risk in ${quarter}.`;
    return `⚠️ **High-Risk Providers in ${quarter}:**\n\n${highRisk
      .map(
        (x, i) =>
          `${i + 1}. **${x.p.name}** (${x.p.state}) — ${x.r.stars.toFixed(1)}★, Risk: ${calcRiskFromStars(x.r.stars)}`,
      )
      .join(
        "\n",
      )}\n\n*These providers require immediate attention and monitoring.*`;
  }

  // Audit
  if (q.includes("audit") || q.includes("auditing")) {
    const declining = allProviders
      .map((p) => ({ p, r: getProviderRatingForQuarter(p.id, quarter) }))
      .filter((x) => x.r.stars < 3.0)
      .slice(0, 5);
    if (declining.length === 0)
      return `✅ All providers are currently performing above the audit threshold (3.0★) in ${quarter}.`;
    return `🔍 **Providers Recommended for Audit (${quarter}):**\n\n${declining
      .map(
        (x, i) =>
          `${i + 1}. **${x.p.name}** — ${x.r.stars.toFixed(1)}★, ${calcRiskFromStars(x.r.stars)} Risk`,
      )
      .join(
        "\n",
      )}\n\n*Audit recommended due to sustained below-benchmark performance.*`;
  }

  // Eligible / pay-for-improvement
  if (
    q.includes("eligible") ||
    q.includes("pay-for-improvement") ||
    q.includes("pay for improvement")
  ) {
    const eligible = allProviders
      .map((p) => ({ p, r: getProviderRatingForQuarter(p.id, quarter) }))
      .filter((x) => x.r.eligibility.tier !== "Not Eligible")
      .slice(0, 6);
    if (eligible.length === 0)
      return `ℹ️ No providers currently qualify for Pay-for-Improvement incentives in ${quarter}. Providers need ≥4.0★ and positive improvement trend to qualify.`;
    return `💰 **Eligible Providers for Pay-for-Improvement (${quarter}):**\n\n${eligible
      .map(
        (x, i) =>
          `${i + 1}. **${x.p.name}** — ${x.r.stars.toFixed(1)}★ · ${x.r.eligibility.tier}`,
      )
      .join(
        "\n",
      )}\n\n*Highly Eligible providers receive a bonus funding allocation.*`;
  }

  // Best / safest / top providers
  if (
    q.includes("best") ||
    q.includes("safest") ||
    q.includes("top") ||
    q.includes("recommended")
  ) {
    const top = allProviders
      .map((p) => ({ p, r: getProviderRatingForQuarter(p.id, quarter) }))
      .sort((a, b) => b.r.stars - a.r.stars)
      .slice(0, 5);
    return `⭐ **Top-Performing Providers in ${quarter}:**\n\n${top
      .map(
        (x, i) =>
          `${i + 1}. **${x.p.name}** (${x.p.state}) — ${x.r.stars.toFixed(1)}★ · ${calcRiskFromStars(x.r.stars)} Risk`,
      )
      .join(
        "\n",
      )}\n\n*These providers demonstrate excellence across safety, quality, and resident experience.*`;
  }

  // Below benchmark
  if (
    q.includes("below benchmark") ||
    q.includes("poor performance") ||
    q.includes("weakest") ||
    q.includes("improve")
  ) {
    const poor = allProviders
      .map((p) => ({ p, r: getProviderRatingForQuarter(p.id, quarter) }))
      .filter((x) => x.r.stars < 3.5)
      .slice(0, 5);
    if (poor.length === 0)
      return `✅ All providers are currently meeting or exceeding benchmark standards in ${quarter}.`;
    return `📉 **Providers Below Benchmark (${quarter}):**\n\n${poor
      .map(
        (x, i) =>
          `${i + 1}. **${x.p.name}** — ${x.r.stars.toFixed(1)}★ · ${calcRiskFromStars(x.r.stars)} Risk`,
      )
      .join(
        "\n",
      )}\n\nKey improvement areas typically include: falls prevention, preventive screening compliance, and staffing levels.`;
  }

  // Screening
  if (q.includes("screening")) {
    return `📋 **National Screening Trends (${quarter}):**\n\nScreening compliance remains a critical indicator. Based on current data:\n\n• **High compliance (≥85%):** providers like ${allProviders
      .slice(0, 2)
      .map((p) => p.name)
      .join(
        ", ",
      )}\n• **Target areas:** Cognitive decline screening and fall-risk assessments remain below national targets in some regions\n• **Recommendation:** Focus on proactive screening bundles for residents aged 80+\n\n*Use the Screening Bundle Tracking module for detailed workflow data.*`;
  }

  // Regional / equity
  if (q.includes("region") || q.includes("equity") || q.includes("state")) {
    return `🗺️ **Regional Performance Summary (${quarter}):**\n\n• **Best performing:** ACT, VIC — consistently above national average\n• **Needs attention:** NT, TAS — lower provider density and screening compliance\n• **Equity gaps:** Remote and First Nations communities continue to show access disparities\n\n*Navigate to Policy Analytics → Equity Gaps for the full regional breakdown.*`;
  }

  // Dementia
  if (q.includes("dementia")) {
    const top = allProviders
      .map((p) => ({ p, r: getProviderRatingForQuarter(p.id, quarter) }))
      .sort((a, b) => b.r.stars - a.r.stars)
      .slice(0, 3);
    return `🧠 **Best Providers for Dementia Care (${quarter}):**\n\n${top
      .map(
        (x, i) =>
          `${i + 1}. **${x.p.name}** (${x.p.state}) — ${x.r.stars.toFixed(1)}★\n   High resident safety scores and specialised care programs`,
      )
      .join(
        "\n\n",
      )}\n\n*Look for providers with high Safety and Quality domain scores for dementia care.*`;
  }

  // Bookings
  if (
    q.includes("booking") ||
    q.includes("appointment") ||
    q.includes("available")
  ) {
    return "📅 **Service Availability:**\n\nTo book a service, navigate to **Find Providers**, select a provider, and click **Book Appointment** on any available service.\n\nAvailable services include:\n• General Care\n• Physiotherapy\n• Medication Review\n• Home Care\n• Mental Health Support\n\n*Check My Bookings for your upcoming appointments.*";
  }

  // National summary
  const avgStars =
    allProviders.reduce(
      (sum, p) => sum + getProviderRatingForQuarter(p.id, quarter).stars,
      0,
    ) / allProviders.length;
  const highRiskCount = allProviders.filter(
    (p) =>
      calcRiskFromStars(getProviderRatingForQuarter(p.id, quarter).stars) ===
      "High",
  ).length;

  return `🏥 **N-ACRM National Summary (${quarter}):**\n\n• **Total Providers:** ${allProviders.length}\n• **National Average Rating:** ${avgStars.toFixed(2)}★\n• **High-Risk Providers:** ${highRiskCount}\n\nI can help you with:\n• Finding the best or highest-risk providers\n• Eligibility for Pay-for-Improvement\n• Regional and equity insights\n• Provider audit recommendations\n\n*Ask me anything about aged care performance data.*`;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1" style={{ padding: "4px 2px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "oklch(0.55 0.08 260)",
            display: "inline-block",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const lines = message.text.split("\n");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: "10px",
        marginBottom: "16px",
        alignItems: "flex-start",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: isUser
            ? "linear-gradient(135deg, oklch(0.52 0.18 260), oklch(0.44 0.22 285))"
            : "linear-gradient(135deg, oklch(0.18 0.055 258), oklch(0.14 0.042 258))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 8px oklch(0 0 0 / 0.15)",
        }}
      >
        {isUser ? (
          <User style={{ width: "15px", height: "15px", color: "#fff" }} />
        ) : (
          <Bot
            style={{
              width: "15px",
              height: "15px",
              color: "oklch(0.74 0.14 86)",
            }}
          />
        )}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: "78%" }}>
        <div
          style={{
            padding: "12px 14px",
            borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
            background: isUser
              ? "linear-gradient(135deg, oklch(0.52 0.18 260), oklch(0.46 0.20 280))"
              : "oklch(0.15 0.048 258 / 0.85)",
            border: isUser ? "none" : "1px solid oklch(0.22 0.055 258)",
            backdropFilter: isUser ? undefined : "blur(8px)",
            boxShadow: "0 2px 12px oklch(0 0 0 / 0.12)",
          }}
        >
          {lines.map((line, i) => {
            const formatted = line.replace(
              /\*\*(.+?)\*\*/g,
              "<strong>$1</strong>",
            );
            return (
              <p
                key={`${message.id}-line-${i}`}
                style={{
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: isUser ? "#fff" : "oklch(0.88 0.018 252)",
                  margin: 0,
                  marginBottom: i < lines.length - 1 ? "4px" : 0,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled markdown-like formatting
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            );
          })}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "oklch(0.55 0.02 252)",
            marginTop: "4px",
            textAlign: isUser ? "right" : "left",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

export default function AIAssistant({
  currentRole,
  currentQuarter,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: `👋 Welcome to the N-ACRM AI Assistant!\n\nI have access to real provider data for ${currentQuarter}. Ask me about performance, risk levels, eligibility, or any aspect of aged care quality.\n\n*Try one of the suggested queries on the left to get started.*`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages or typing change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const response = generateResponse(text, currentRole, currentQuarter);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  const heroStyle: React.CSSProperties = {
    background:
      "linear-gradient(135deg, oklch(0.14 0.055 258) 0%, oklch(0.10 0.042 258) 100%)",
    padding: "24px 28px",
    flexShrink: 0,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Hero */}
      <div style={heroStyle}>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background:
                "linear-gradient(135deg, oklch(0.48 0.18 260), oklch(0.40 0.22 290))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Bot
              style={{
                width: "18px",
                height: "18px",
                color: "oklch(0.74 0.14 86)",
              }}
            />
          </div>
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "#fff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              AI Assistant
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "oklch(0.65 0.025 252)",
                marginTop: "2px",
              }}
            >
              {ROLE_SUBTITLES[currentRole]}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Suggested Queries Sidebar */}
        <div
          style={{
            width: "220px",
            flexShrink: 0,
            borderRight: "1px solid oklch(0.88 0.01 252)",
            padding: "16px",
            overflowY: "auto",
            background: "oklch(0.98 0.006 252)",
          }}
        >
          <h3
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "oklch(0.50 0.04 258)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "10px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Suggested Queries
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {ROLE_QUERIES[currentRole].map((q) => (
              <button
                key={q}
                type="button"
                data-ocid="ai_assistant.suggestion_button"
                onClick={() => sendMessage(q)}
                style={{
                  textAlign: "left",
                  padding: "9px 11px",
                  borderRadius: "8px",
                  border: "1px solid oklch(0.88 0.015 258)",
                  background: "white",
                  fontSize: "12px",
                  color: "oklch(0.28 0.055 258)",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  lineHeight: 1.4,
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.95 0.03 260)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "oklch(0.62 0.12 260)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "white";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "oklch(0.88 0.015 258)";
                }}
              >
                {q}
              </button>
            ))}
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              borderRadius: "8px",
              background: "oklch(0.14 0.055 258 / 0.06)",
              border: "1px solid oklch(0.85 0.02 258)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "oklch(0.45 0.04 258)",
                lineHeight: 1.5,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Responses are generated from real provider data for{" "}
              <strong>{currentQuarter}</strong>.
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Messages */}
          <div
            data-ocid="ai_assistant.panel"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px",
              background:
                "linear-gradient(180deg, oklch(0.97 0.008 258) 0%, oklch(0.99 0.004 252) 100%)",
            }}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(135deg, oklch(0.18 0.055 258), oklch(0.14 0.042 258))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Bot
                    style={{
                      width: "15px",
                      height: "15px",
                      color: "oklch(0.74 0.14 86)",
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "4px 14px 14px 14px",
                    background: "oklch(0.15 0.048 258 / 0.85)",
                    border: "1px solid oklch(0.22 0.055 258)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid oklch(0.88 0.01 252)",
              background: "white",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <Input
              data-ocid="ai_assistant.input"
              placeholder="Ask anything about aged care performance…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              style={{
                flex: 1,
                fontSize: "13px",
                height: "40px",
                border: "1px solid oklch(0.85 0.02 258)",
                borderRadius: "10px",
              }}
            />
            <button
              type="button"
              data-ocid="ai_assistant.submit_button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background:
                  input.trim() && !isTyping
                    ? "linear-gradient(135deg, oklch(0.52 0.18 260), oklch(0.44 0.22 285))"
                    : "oklch(0.88 0.01 252)",
                border: "none",
                cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 150ms ease",
              }}
            >
              <Send
                style={{
                  width: "16px",
                  height: "16px",
                  color:
                    input.trim() && !isTyping ? "#fff" : "oklch(0.60 0.02 252)",
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
