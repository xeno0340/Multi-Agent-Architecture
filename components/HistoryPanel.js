import { colors, fonts } from "../lib/theme";

export default function HistoryPanel({ learnerId, history }) {
  if (!history || history.length === 0) return null;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.dot} />
        <span style={styles.title}>
          {learnerId}'s history on this device
        </span>
        <span style={styles.count}>{history.length}</span>
      </div>
      <div style={styles.list}>
        {history.slice(-5).reverse().map((h, i) => {
          const struggled = h.feedback?.includes("struggled") || h.feedback?.startsWith("scored") && h.difficulty === "beginner";
          return (
            <div key={i} style={styles.row}>
              <span style={styles.topicName}>{h.topic}</span>
              <span style={styles.difficultyTag}>{h.difficulty}</span>
              <span style={{ ...styles.feedback, color: struggled ? colors.error : colors.success }}>
                {h.feedback}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: colors.bgCardAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: "16px 20px",
    marginBottom: 20,
  },
  header: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: colors.success,
    display: "inline-block",
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  count: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    background: colors.bg,
    padding: "2px 8px",
    borderRadius: 20,
  },
  list: { display: "flex", flexDirection: "column", gap: 6 },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    fontFamily: fonts.body,
  },
  topicName: { color: colors.textPrimary, minWidth: 120 },
  difficultyTag: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    background: colors.bg,
    padding: "2px 8px",
    borderRadius: 6,
  },
  feedback: { fontSize: 12, marginLeft: "auto" },
};