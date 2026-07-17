export default function LearnerForm({
  learnerId, setLearnerId,
  board, setBoard,
  topic, setTopic,
  learnerContext, setLearnerContext,
  loading, onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} style={styles.form}>
      <label style={styles.label}>Learner name (used to remember their history on this device)</label>
      <input
        style={styles.input}
        placeholder="e.g. Rahul"
        value={learnerId}
        onChange={(e) => setLearnerId(e.target.value)}
        required
      />

      <label style={styles.label}>Board & Class (optional — for curriculum alignment)</label>
      <input
        style={styles.input}
        placeholder="e.g. CBSE Class 10, ICSE Class 8, or leave blank"
        value={board}
        onChange={(e) => setBoard(e.target.value)}
      />

      <label style={styles.label}>Topic</label>
      <input
        style={styles.input}
        placeholder="e.g. Recursion, Photosynthesis, Fractions"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        required
      />

      <label style={styles.label}>Learner context</label>
      <input
        style={styles.input}
        placeholder="e.g. 2nd-year CS student who knows loops but not recursion"
        value={learnerContext}
        onChange={(e) => setLearnerContext(e.target.value)}
        required
      />

      <button style={styles.button} disabled={loading} type="submit">
        {loading ? "Orchestrating agents..." : "Generate"}
      </button>
    </form>
  );
}

const styles = {
  form: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  label: { fontSize: 13, color: "#b0b0b0", marginTop: 8 },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#1a1d24", color: "#fff", fontSize: 15 },
  button: { marginTop: 16, padding: "12px 16px", borderRadius: 8, border: "none", background: "#7c5cff", color: "#fff", fontSize: 15, cursor: "pointer" },
};