export default function HistoryPanel({ learnerId, history }) {
  if (!history || history.length === 0) return null;

  return (
    <div style={styles.historyBox}>
      <strong style={{ color: "#c9c2ff" }}>
        {learnerId}'s learning history on this device ({history.length} session
        {history.length > 1 ? "s" : ""}):
      </strong>
      <ul style={{ marginTop: 8 }}>
        {history.slice(-5).map((h, i) => (
          <li key={i} style={{ fontSize: 13, color: "#a0a0a0" }}>
            {h.topic} ({h.difficulty}) —{" "}
            {h.feedback === "struggled" ? "⚠️ struggled" : "✅ made sense"}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  historyBox: { background: "#1a1d24", padding: 14, borderRadius: 10, border: "1px solid #2a2d34", marginBottom: 20 },
};