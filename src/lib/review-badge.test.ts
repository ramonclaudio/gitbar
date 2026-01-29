import { describe, expect, it } from "vitest";
import { getReviewBadge } from "./review-badge";

describe("getReviewBadge", () => {
  it("returns null for null decision", () => {
    expect(getReviewBadge(null)).toBeNull();
  });

  it("returns Approved badge (full)", () => {
    const badge = getReviewBadge("APPROVED");
    expect(badge).toEqual({
      text: "Approved",
      className: "bg-accent-green/20 text-accent-green border-0",
    });
  });

  it("returns Approved badge (short)", () => {
    const badge = getReviewBadge("APPROVED", true);
    expect(badge!.text).toBe("Approved");
  });

  it("returns Changes Requested badge (full)", () => {
    const badge = getReviewBadge("CHANGES_REQUESTED");
    expect(badge!.text).toBe("Changes Requested");
  });

  it("returns Changes badge (short)", () => {
    const badge = getReviewBadge("CHANGES_REQUESTED", true);
    expect(badge!.text).toBe("Changes");
  });

  it("returns Review Required badge (full)", () => {
    const badge = getReviewBadge("REVIEW_REQUIRED");
    expect(badge!.text).toBe("Review Required");
  });

  it("returns Review badge (short)", () => {
    const badge = getReviewBadge("REVIEW_REQUIRED", true);
    expect(badge!.text).toBe("Review");
  });
});
