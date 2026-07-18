import { colors, fonts } from "../lib/theme";
import { useIsMobile } from "../lib/useIsMobile";

export default function LearnerForm({
  learnerId, setLearnerId,
  board, setBoard,
  topic, setTopic,
  learnerContext, setLearnerContext,
  loading, onSubmit,
}) {
  const isMobile = useIsMobile();

  return (
    <form onSubmit={onSubmit} style={{ ...styles.card, padding: isMobile ? 18 : 28 }}>
      <div style={styles.cardHeader}>
        <span style={styles.cardEyebrow}>New Request</span>
        <h2 style={{ ...styles.cardTitle, fontSize: isMobile ? 18 : 22 }}>Tell us who's learning</h2>
      </div>

      <div style={{ ...styles.grid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
        <div style={styles.field}>
          <label style={styles.label} htmlFor="learnerId">
            Learner name
            <span style={styles.hint}>remembers their history on this device</span>
          </label>
          <input
            id="learnerId"
            style={styles.input}
            placeholder="e.g. Rahul"
            value={learnerId}
            onChange={(e) => setLearnerId(e.target.value)}
            required
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label} htmlFor="board">
            Board & Class
            <span style={styles.hint}>optional — for curriculum alignment</span>
          </label>
          <input
            id="board"
            style={styles.input}
            placeholder="e.g. CBSE Class 10"
            value={board}
            onChange={(e) => setBoard(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label} htmlFor="topic">Topic</label>
        <input
          id="topic"
          style={styles.input}
          placeholder="e.g. Recursion, Photosynthesis, Fractions"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label} htmlFor="learnerContext">Learner context</label>
        <input
          id="learnerContext"
          style={styles.input}
          placeholder="e.g. 2nd-year CS student who knows loops but not recursion"
          value={learnerContext}
          onChange={(e) => setLearnerContext(e.target.value)}
          required
        />
      </div>

      <button style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading} type="submit">
        {loading ? "Orchestrating agents…" : "Generate"}
      </button>
    </form>
  );
}

const styles = {
  card: {
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    marginBottom: 20,
  },
  cardHeader: { marginBottom: 20 },
  cardEyebrow: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontWeight: 700,
    color: colors.textPrimary,
    margin: "4px 0 0",
  },
  grid: {
    display: "grid",
    gap: 16,
  },
  field: { display: "flex", flexDirection: "column", gap: 6, marginTop: 16 },
  label: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: 500,
    color: colors.textSecondary,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  hint: { fontSize: 11, fontWeight: 400, color: colors.textMuted },
  input: {
    fontFamily: fonts.body,
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${colors.border}`,
    background: colors.bg,
    color: colors.textPrimary,
    fontSize: 16, // 16px prevents iOS Safari auto-zoom on focus
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    marginTop: 24,
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: "none",
    background: colors.orchestrator,
    color: "#12141c",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
};