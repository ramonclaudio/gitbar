type ReviewDecision = "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" | null;

interface ReviewBadge {
  text: string;
  className: string;
}

const BADGES: Record<string, { full: string; short: string; className: string }> = {
  APPROVED: {
    full: "Approved",
    short: "Approved",
    className: "bg-accent-green/20 text-accent-green border-0",
  },
  CHANGES_REQUESTED: {
    full: "Changes Requested",
    short: "Changes",
    className: "bg-red-500/20 text-red-400 border-0",
  },
  REVIEW_REQUIRED: {
    full: "Review Required",
    short: "Review",
    className: "bg-yellow-500/20 text-yellow-400 border-0",
  },
};

export function getReviewBadge(decision: ReviewDecision, short = false): ReviewBadge | null {
  if (!decision) return null;
  const badge = BADGES[decision];
  if (!badge) return null;
  return { text: short ? badge.short : badge.full, className: badge.className };
}
