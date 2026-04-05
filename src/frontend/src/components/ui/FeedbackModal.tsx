import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FeedbackData } from "@/context/BookingContext";
import { CheckCircle, Star, X } from "lucide-react";
import { useState } from "react";

export interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  providerId: string;
  providerName: string;
  service: string;
  onSubmit: (data: FeedbackData) => void;
}

function StarPicker({
  value,
  onChange,
  size = "lg",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const dim = size === "lg" ? 28 : 18;
  return (
    <div style={{ display: "flex", gap: size === "lg" ? "6px" : "3px" }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= (hovered || value);
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transform: active ? "scale(1.15)" : "scale(1)",
              transition: "transform 0.12s ease, filter 0.12s ease",
              filter: active ? "drop-shadow(0 0 4px #f59e0b88)" : "none",
            }}
          >
            <Star
              size={dim}
              fill={active ? "#f59e0b" : "none"}
              color={active ? "#f59e0b" : "#d1d5db"}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}

const DOMAIN_LABELS: Array<{
  key: keyof FeedbackData;
  label: string;
  emoji: string;
}> = [
  { key: "safety", label: "Safety & Care Quality", emoji: "🛡️" },
  { key: "quality", label: "Overall Service Quality", emoji: "⭐" },
  { key: "experience", label: "Patient Experience", emoji: "❤️" },
  { key: "preventive", label: "Preventive Care", emoji: "💊" },
];

export default function FeedbackModal({
  open,
  onClose,
  bookingId: _bookingId,
  providerId: _providerId,
  providerName,
  service,
  onSubmit,
}: FeedbackModalProps) {
  const [fd, setFd] = useState<FeedbackData>({
    overall: 0,
    safety: 0,
    quality: 0,
    experience: 0,
    preventive: 0,
    comment: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (fd.overall === 0) {
      setError("Please select an overall star rating before submitting.");
      return;
    }
    setError("");
    // Fill any un-rated indicators with the overall rating
    const filled: FeedbackData = {
      overall: fd.overall,
      safety: fd.safety || fd.overall,
      quality: fd.quality || fd.overall,
      experience: fd.experience || fd.overall,
      preventive: fd.preventive || fd.overall,
      comment: fd.comment,
    };
    onSubmit(filled);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFd({
        overall: 0,
        safety: 0,
        quality: 0,
        experience: 0,
        preventive: 0,
        comment: "",
      });
      onClose();
    }, 2200);
  }

  if (!open) return null;

  return (
    <div
      data-ocid="feedback.modal"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.18s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%)",
            borderRadius: "20px 20px 0 0",
            padding: "20px 24px 16px",
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            data-ocid="feedback.close_button"
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
            }}
          >
            <X size={14} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "rgba(251,191,36,0.18)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Star size={18} fill="#f59e0b" color="#f59e0b" />
            </div>
            <div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Rate Your Experience
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "12px",
                  margin: 0,
                  marginTop: "2px",
                }}
              >
                {providerName}
              </p>
            </div>
          </div>
          <div style={{ marginTop: "10px" }}>
            <span
              style={{
                display: "inline-block",
                background: "rgba(59,130,246,0.25)",
                border: "1px solid rgba(59,130,246,0.5)",
                borderRadius: "20px",
                padding: "2px 10px",
                fontSize: "11px",
                color: "#93c5fd",
                fontWeight: 600,
              }}
            >
              {service}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {submitted ? (
            <div
              data-ocid="feedback.success_state"
              style={{
                textAlign: "center",
                padding: "32px 16px",
                animation: "fadeIn 0.3s ease",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              >
                <CheckCircle size={32} color="#059669" />
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#065f46",
                  marginBottom: "8px",
                }}
              >
                Thank You!
              </h3>
              <p
                style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.5 }}
              >
                Your feedback helps improve aged care services across Australia.
                Provider scores have been updated in real time.
              </p>
            </div>
          ) : (
            <>
              {/* Overall Rating */}
              <div style={{ marginBottom: "24px" }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: "12px",
                  }}
                >
                  Overall Rating <span style={{ color: "#ef4444" }}>*</span>
                </p>
                <StarPicker
                  value={fd.overall}
                  onChange={(v) => setFd((p) => ({ ...p, overall: v }))}
                  size="lg"
                />
                {error && (
                  <p
                    data-ocid="feedback.error_state"
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      marginTop: "8px",
                    }}
                  >
                    {error}
                  </p>
                )}
              </div>

              {/* Domain Ratings */}
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: "14px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Indicator Ratings
                  <span
                    style={{
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                      marginLeft: "6px",
                      color: "#9ca3af",
                    }}
                  >
                    (optional)
                  </span>
                </p>
                {DOMAIN_LABELS.map(({ key, label, emoji }) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>{emoji}</span> {label}
                    </span>
                    <StarPicker
                      value={fd[key] as number}
                      onChange={(v) => setFd((p) => ({ ...p, [key]: v }))}
                      size="sm"
                    />
                  </div>
                ))}
              </div>

              {/* Comments */}
              <div style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Share your experience{" "}
                  <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                    (optional)
                  </span>
                </p>
                <Textarea
                  data-ocid="feedback.textarea"
                  value={fd.comment}
                  onChange={(e) =>
                    setFd((p) => ({ ...p, comment: e.target.value }))
                  }
                  placeholder="Tell us about your experience with this provider…"
                  rows={3}
                  style={{
                    resize: "none",
                    fontSize: "13px",
                    borderColor: "#e5e7eb",
                    borderRadius: "10px",
                  }}
                />
              </div>

              {/* Actions */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <Button
                  data-ocid="feedback.submit_button"
                  onClick={handleSubmit}
                  style={{
                    background: "linear-gradient(135deg,#1e3a8a,#312e81)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    height: "42px",
                    fontWeight: 700,
                    fontSize: "14px",
                    width: "100%",
                  }}
                >
                  Submit Rating
                </Button>
                <button
                  type="button"
                  data-ocid="feedback.cancel_button"
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#9ca3af",
                    fontSize: "12px",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  Skip for now
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes popIn { from { transform: scale(0.5) } to { transform: scale(1) } }
      `}</style>
    </div>
  );
}
