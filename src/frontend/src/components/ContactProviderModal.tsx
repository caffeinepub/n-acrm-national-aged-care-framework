import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Mail, MapPin, Phone, PhoneCall } from "lucide-react";
import { useState } from "react";
import { PROVIDER_CONTACTS } from "../data/providerContacts";

interface ContactProviderModalProps {
  providerId: string;
  providerName: string;
  open: boolean;
  onClose: () => void;
}

const cardStyle: React.CSSProperties = {
  background: "oklch(0.16 0.052 258 / 0.8)",
  border: "1px solid oklch(0.24 0.055 258)",
  borderRadius: "12px",
  padding: "16px",
  flex: 1,
  cursor: "pointer",
  transition: "all 150ms ease",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

export default function ContactProviderModal({
  providerId,
  providerName,
  open,
  onClose,
}: ContactProviderModalProps) {
  const contact = PROVIDER_CONTACTS[providerId];
  const [callbackName, setCallbackName] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [activeAction, setActiveAction] = useState<
    "call" | "email" | "callback" | null
  >(null);

  const handleSubmitCallback = () => {
    if (!callbackName.trim()) return;
    setCallbackSubmitted(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent
        style={{
          background: "oklch(0.13 0.052 258)",
          border: "1px solid oklch(0.22 0.055 258)",
          borderRadius: "16px",
          maxWidth: "520px",
          color: "#fff",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              color: "#fff",
              fontSize: "18px",
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Contact Provider
          </DialogTitle>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Provider info */}
          <div
            style={{
              background: "oklch(0.16 0.052 258 / 0.6)",
              border: "1px solid oklch(0.22 0.055 258)",
              borderRadius: "10px",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "8px",
              }}
            >
              {providerName}
            </div>
            {contact ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "oklch(0.78 0.022 252)",
                  }}
                >
                  <MapPin
                    style={{
                      width: "13px",
                      height: "13px",
                      color: "oklch(0.62 0.12 260)",
                    }}
                  />
                  {contact.address}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "oklch(0.78 0.022 252)",
                  }}
                >
                  <Phone
                    style={{
                      width: "13px",
                      height: "13px",
                      color: "oklch(0.62 0.12 260)",
                    }}
                  />
                  {contact.phone}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    color: "oklch(0.78 0.022 252)",
                  }}
                >
                  <Mail
                    style={{
                      width: "13px",
                      height: "13px",
                      color: "oklch(0.62 0.12 260)",
                    }}
                  />
                  {contact.email}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "13px", color: "oklch(0.55 0.025 252)" }}>
                Contact information not available for this provider.
              </div>
            )}
          </div>

          {contact && (
            <>
              {/* Action Cards */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  style={{
                    ...cardStyle,
                    borderColor:
                      activeAction === "call"
                        ? "oklch(0.62 0.18 260 / 0.6)"
                        : "oklch(0.24 0.055 258)",
                    background:
                      activeAction === "call"
                        ? "oklch(0.62 0.18 260 / 0.15)"
                        : "oklch(0.16 0.052 258 / 0.8)",
                  }}
                  onClick={() =>
                    setActiveAction(activeAction === "call" ? null : "call")
                  }
                >
                  <Phone
                    style={{
                      width: "20px",
                      height: "20px",
                      color: "oklch(0.62 0.18 260)",
                    }}
                  />
                  <div
                    style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}
                  >
                    Call
                  </div>
                  <div
                    style={{ fontSize: "11px", color: "oklch(0.60 0.022 252)" }}
                  >
                    Direct phone
                  </div>
                </button>
                <button
                  type="button"
                  style={{
                    ...cardStyle,
                    borderColor:
                      activeAction === "email"
                        ? "oklch(0.74 0.14 86 / 0.6)"
                        : "oklch(0.24 0.055 258)",
                    background:
                      activeAction === "email"
                        ? "oklch(0.74 0.14 86 / 0.1)"
                        : "oklch(0.16 0.052 258 / 0.8)",
                  }}
                  onClick={() =>
                    setActiveAction(activeAction === "email" ? null : "email")
                  }
                >
                  <Mail
                    style={{
                      width: "20px",
                      height: "20px",
                      color: "oklch(0.74 0.14 86)",
                    }}
                  />
                  <div
                    style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}
                  >
                    Email
                  </div>
                  <div
                    style={{ fontSize: "11px", color: "oklch(0.60 0.022 252)" }}
                  >
                    Send message
                  </div>
                </button>
                <button
                  type="button"
                  style={{
                    ...cardStyle,
                    borderColor:
                      activeAction === "callback"
                        ? "oklch(0.72 0.18 142 / 0.6)"
                        : "oklch(0.24 0.055 258)",
                    background:
                      activeAction === "callback"
                        ? "oklch(0.72 0.18 142 / 0.1)"
                        : "oklch(0.16 0.052 258 / 0.8)",
                  }}
                  onClick={() =>
                    setActiveAction(
                      activeAction === "callback" ? null : "callback",
                    )
                  }
                >
                  <PhoneCall
                    style={{
                      width: "20px",
                      height: "20px",
                      color: "oklch(0.72 0.18 142)",
                    }}
                  />
                  <div
                    style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}
                  >
                    Callback
                  </div>
                  <div
                    style={{ fontSize: "11px", color: "oklch(0.60 0.022 252)" }}
                  >
                    Request call
                  </div>
                </button>
              </div>

              {/* Action Details */}
              {activeAction === "call" && (
                <div
                  style={{
                    background: "oklch(0.62 0.18 260 / 0.1)",
                    border: "1px solid oklch(0.62 0.18 260 / 0.3)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "oklch(0.70 0.025 252)",
                      marginBottom: "6px",
                    }}
                  >
                    Phone number
                  </div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "oklch(0.62 0.18 260)",
                      marginBottom: "10px",
                    }}
                  >
                    {contact.phone}
                  </div>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    style={{
                      display: "inline-block",
                      padding: "9px 18px",
                      borderRadius: "8px",
                      background:
                        "linear-gradient(135deg, oklch(0.52 0.18 260), oklch(0.44 0.22 285))",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Open Phone Dialer
                  </a>
                </div>
              )}

              {activeAction === "email" && (
                <div
                  style={{
                    background: "oklch(0.74 0.14 86 / 0.08)",
                    border: "1px solid oklch(0.74 0.14 86 / 0.25)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "oklch(0.70 0.025 252)",
                      marginBottom: "6px",
                    }}
                  >
                    Email address
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "oklch(0.74 0.14 86)",
                      marginBottom: "10px",
                    }}
                  >
                    {contact.email}
                  </div>
                  <a
                    href={`mailto:${contact.email}`}
                    style={{
                      display: "inline-block",
                      padding: "9px 18px",
                      borderRadius: "8px",
                      background:
                        "linear-gradient(135deg, oklch(0.60 0.14 86), oklch(0.52 0.16 60))",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Open Email Client
                  </a>
                </div>
              )}

              {activeAction === "callback" && (
                <div
                  style={{
                    background: "oklch(0.72 0.18 142 / 0.08)",
                    border: "1px solid oklch(0.72 0.18 142 / 0.25)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                  }}
                >
                  {callbackSubmitted ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 0",
                      }}
                    >
                      <CheckCircle
                        style={{
                          width: "36px",
                          height: "36px",
                          color: "oklch(0.72 0.18 142)",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 600,
                          color: "#fff",
                        }}
                      >
                        Callback Requested!
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "oklch(0.65 0.025 252)",
                          textAlign: "center",
                        }}
                      >
                        We&apos;ll notify {providerName} to call you back.
                        Expect a response within 24 hours.
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <Label
                          style={{
                            color: "oklch(0.78 0.022 252)",
                            fontSize: "12px",
                            marginBottom: "5px",
                            display: "block",
                          }}
                        >
                          Your Name
                        </Label>
                        <Input
                          value={callbackName}
                          onChange={(e) => setCallbackName(e.target.value)}
                          placeholder="Enter your name"
                          style={{
                            background: "oklch(0.18 0.052 258)",
                            border: "1px solid oklch(0.28 0.055 258)",
                            color: "#fff",
                            fontSize: "13px",
                          }}
                        />
                      </div>
                      <div>
                        <Label
                          style={{
                            color: "oklch(0.78 0.022 252)",
                            fontSize: "12px",
                            marginBottom: "5px",
                            display: "block",
                          }}
                        >
                          Best Time to Call
                        </Label>
                        <Select
                          value={callbackTime}
                          onValueChange={setCallbackTime}
                        >
                          <SelectTrigger
                            style={{
                              background: "oklch(0.18 0.052 258)",
                              border: "1px solid oklch(0.28 0.055 258)",
                              color: "#fff",
                              fontSize: "13px",
                            }}
                          >
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">
                              Morning (8am–12pm AEST)
                            </SelectItem>
                            <SelectItem value="afternoon">
                              Afternoon (12pm–4pm AEST)
                            </SelectItem>
                            <SelectItem value="evening">
                              Late Afternoon (4pm–6pm AEST)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <button
                        type="button"
                        disabled={!callbackName.trim() || !callbackTime}
                        onClick={handleSubmitCallback}
                        style={{
                          padding: "9px 18px",
                          borderRadius: "8px",
                          background:
                            callbackName.trim() && callbackTime
                              ? "linear-gradient(135deg, oklch(0.52 0.22 142), oklch(0.44 0.20 160))"
                              : "oklch(0.24 0.035 258)",
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor:
                            callbackName.trim() && callbackTime
                              ? "pointer"
                              : "not-allowed",
                          border: "none",
                        }}
                      >
                        Submit Callback Request
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
