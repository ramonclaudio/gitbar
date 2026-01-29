import { memo } from "react";

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  // W3C relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export const LabelBadge = memo(function LabelBadge({
  label,
}: {
  label: { name: string; color: string };
}) {
  const light = isLightColor(label.color);
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
      style={{
        backgroundColor: `#${label.color}`,
        color: light ? "#1f2328" : "#ffffff",
        textShadow: light ? "none" : "0 1px 1px rgba(0,0,0,0.3)",
      }}
    >
      {label.name}
    </span>
  );
});
