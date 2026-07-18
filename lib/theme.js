// Shared design tokens. Every component imports colors/fonts from here
// so the visual identity stays consistent across the whole app.

export const colors = {
  bg: "#0d0e14",
  bgCard: "#1a1d27",
  bgCardAlt: "#1f2330",
  border: "#2a2e3d",
  textPrimary: "#e8e9ee",
  textSecondary: "#9296a8",
  textMuted: "#6b6f80",

  orchestrator: "#f5a623",
  curriculum: "#2dd4bf",
  content: "#60a5fa",
  storytelling: "#f472b6",
  assessment: "#34d399",

  success: "#34d399",
  error: "#f87171",
  errorBg: "#2d1a1a",
};

export const fonts = {
  display: "'Space Grotesk', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

export function agentColor(agent) {
  return colors[agent] || colors.textSecondary;
}

// Converts a hex color + opacity into an rgba() string, used to give each
// agent's section a subtly tinted background instead of flat uniform dark.
export function tint(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}