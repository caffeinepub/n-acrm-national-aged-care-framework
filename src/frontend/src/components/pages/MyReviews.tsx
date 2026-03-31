import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Star, Trash2 } from "lucide-react";
import { useState } from "react";

interface Review {
  id: string;
  providerName: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  edited: boolean;
}

const SEED_REVIEWS: Review[] = [
  {
    id: "r1",
    providerName: "Yarra Valley Life Care",
    service: "General Care",
    rating: 5,
    comment:
      "Exceptional care and professionalism throughout my visit. The staff were warm, attentive, and clearly passionate about supporting residents. Highly recommend to anyone considering aged care options in Melbourne.",
    date: "2026-03-10",
    edited: false,
  },
  {
    id: "r2",
    providerName: "Bondi Aged Care Centre",
    service: "Physiotherapy",
    rating: 4,
    comment:
      "Good physiotherapy session — the therapist was knowledgeable and thorough. Wait times were a little longer than expected but overall a positive experience.",
    date: "2026-02-22",
    edited: false,
  },
  {
    id: "r3",
    providerName: "Southbank Senior Living",
    service: "Medication Review",
    rating: 3,
    comment:
      "The review was helpful but the pharmacist seemed rushed. I had several questions that weren't fully answered. The facility itself is clean and modern, though.",
    date: "2026-02-05",
    edited: false,
  },
  {
    id: "r4",
    providerName: "Glenelg Senior Services",
    service: "Home Care",
    rating: 5,
    comment:
      "Outstanding home care service. The carer arrived on time, was respectful and thorough, and genuinely improved my parent's quality of life. Will book again without hesitation.",
    date: "2026-01-18",
    edited: false,
  },
  {
    id: "r5",
    providerName: "Fremantle Aged Care",
    service: "Mental Health Support",
    rating: 2,
    comment:
      "Unfortunately the session felt impersonal and the counsellor appeared distracted. The facility was pleasant but the quality of care needs improvement for mental health services specifically.",
    date: "2026-01-08",
    edited: false,
  },
];

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          style={{
            color: s <= rating ? "#fbbf24" : "rgba(255,255,255,0.15)",
            fill: s <= rating ? "#fbbf24" : "none",
          }}
        />
      ))}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= (hovered || value);
        return (
          <button
            key={s}
            type="button"
            data-ocid={`reviews.star_picker.${s}.toggle`}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(s)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px",
              transition: "transform 0.12s",
              transform: filled ? "scale(1.15)" : "scale(1)",
            }}
          >
            <Star
              size={24}
              style={{
                color: filled ? "#fbbf24" : "rgba(255,255,255,0.2)",
                fill: filled ? "#fbbf24" : "none",
                filter: filled ? "drop-shadow(0 0 4px #fbbf2460)" : "none",
                transition: "color 0.12s, fill 0.12s",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

const CARD_STYLE = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(12px)" as const,
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "16px",
  color: "white" as const,
};

export default function MyReviews() {
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const openEdit = (review: Review) => {
    setEditReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleSaveEdit = () => {
    if (!editReview) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === editReview.id
          ? { ...r, rating: editRating, comment: editComment, edited: true }
          : r,
      ),
    );
    setEditReview(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setReviews((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div
      style={{
        background: "#0a0f1e",
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Hero */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f1b35 0%, #1a2d5a 50%, #0d1540 100%)",
          padding: "40px 32px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <Star size={20} color="#fbbf24" />
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#fff",
                margin: 0,
              }}
            >
              My Reviews
            </h1>
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              margin: 0,
            }}
          >
            View, edit, or delete the feedback you've left for aged care
            providers.
          </p>
        </div>
      </div>

      <div
        style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}
      >
        {/* Summary stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {[
            { label: "Total Reviews", value: reviews.length.toString() },
            {
              label: "Avg Rating",
              value: reviews.length > 0 ? avgRating.toFixed(1) : "—",
            },
            {
              label: "Providers Reviewed",
              value: new Set(
                reviews.map((r) => r.providerName),
              ).size.toString(),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                ...CARD_STYLE,
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              {label === "Avg Rating" && reviews.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "4px",
                  }}
                >
                  <StarDisplay rating={Math.round(avgRating)} size={12} />
                </div>
              )}
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: "4px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div
            data-ocid="reviews.empty_state"
            style={{ ...CARD_STYLE, padding: "60px 24px", textAlign: "center" }}
          >
            <Star
              size={40}
              color="rgba(255,255,255,0.2)"
              style={{ margin: "0 auto 12px" }}
            />
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px" }}>
              You haven't submitted any reviews yet.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {reviews.map((review, idx) => (
              <div
                key={review.id}
                data-ocid={`reviews.item.${idx + 1}`}
                style={{ ...CARD_STYLE, padding: "24px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 800,
                          color: "#fff",
                        }}
                      >
                        {review.providerName}
                      </span>
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: "12px",
                          background: "rgba(59,130,246,0.12)",
                          border: "1px solid rgba(59,130,246,0.25)",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#60a5fa",
                        }}
                      >
                        {review.service}
                      </span>
                      {review.edited && (
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "12px",
                            background: "rgba(251,191,36,0.1)",
                            border: "1px solid rgba(251,191,36,0.25)",
                            fontSize: "10px",
                            fontWeight: 600,
                            color: "#fbbf24",
                          }}
                        >
                          Edited
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "6px",
                      }}
                    >
                      <StarDisplay rating={review.rating} />
                      <span
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.35)",
                        }}
                      >
                        {formatDate(review.date)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`reviews.edit.button.${idx + 1}`}
                      onClick={() => openEdit(review)}
                      style={{
                        fontSize: "11px",
                        borderColor: "rgba(59,130,246,0.35)",
                        color: "#60a5fa",
                        background: "transparent",
                      }}
                    >
                      <Edit2 size={11} className="mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      data-ocid={`reviews.delete.button.${idx + 1}`}
                      onClick={() => setDeleteId(review.id)}
                      style={{
                        fontSize: "11px",
                        borderColor: "rgba(239,68,68,0.35)",
                        color: "#f87171",
                        background: "transparent",
                      }}
                    >
                      <Trash2 size={11} className="mr-1" /> Delete
                    </Button>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.62)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editReview}
        onOpenChange={(open) => {
          if (!open) setEditReview(null);
        }}
      >
        <DialogContent
          data-ocid="reviews.edit.dialog"
          style={{
            background: "#0f1b35",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
            maxWidth: "480px",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#fff" }}>Edit Review</DialogTitle>
          </DialogHeader>
          {editReview && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginTop: "4px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "8px",
                    fontWeight: 600,
                  }}
                >
                  {editReview.providerName} · {editReview.service}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "8px",
                    fontWeight: 600,
                  }}
                >
                  Your Rating
                </div>
                <StarPicker value={editRating} onChange={setEditRating} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: "8px",
                    fontWeight: 600,
                  }}
                >
                  Your Comment
                </div>
                <Textarea
                  data-ocid="reviews.edit.textarea"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience…"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                    borderRadius: "8px",
                    fontSize: "13px",
                    resize: "none",
                  }}
                />
              </div>
            </div>
          )}
          <DialogFooter style={{ marginTop: "8px" }}>
            <Button
              variant="outline"
              data-ocid="reviews.edit.cancel_button"
              onClick={() => setEditReview(null)}
              style={{
                borderColor: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)",
                background: "transparent",
              }}
            >
              Cancel
            </Button>
            <Button
              data-ocid="reviews.edit.save_button"
              disabled={editRating === 0}
              onClick={handleSaveEdit}
              style={{ background: "#3b82f6", color: "#fff", border: "none" }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent
          data-ocid="reviews.delete.dialog"
          style={{
            background: "#0f1b35",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "#fff" }}>
              Delete Review
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: "rgba(255,255,255,0.5)" }}>
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="reviews.delete.cancel_button"
              style={{
                background: "transparent",
                borderColor: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="reviews.delete.confirm_button"
              onClick={handleDelete}
              style={{ background: "#ef4444", color: "#fff", border: "none" }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
