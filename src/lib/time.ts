const TIME_INTERVALS = [
  { label: "y", seconds: 31536000 },
  { label: "mo", seconds: 2592000 },
  { label: "w", seconds: 604800 },
  { label: "d", seconds: 86400 },
  { label: "h", seconds: 3600 },
  { label: "m", seconds: 60 },
] as const;

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  for (const { label, seconds: s } of TIME_INTERVALS) {
    const count = Math.floor(seconds / s);
    if (count >= 1) return `${count}${label}`;
  }
  return "now";
}

export function getOrdinalSuffix(day: number): string {
  switch (day) {
    case 1:
    case 21:
    case 31:
      return "st";
    case 2:
    case 22:
      return "nd";
    case 3:
    case 23:
      return "rd";
    default:
      return "th";
  }
}
