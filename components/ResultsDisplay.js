export default function ResultsDisplay({ data, learnerId, feedbackGiven, onFeedback }) {
  if (!data) return null;

  return (
    <div style={styles.results}>
      <section style={styles.planBox}>
        <h3 style={styles.h3}>Orchestrator Plan (live decision)</h3>
        <pre style={styles.pre}>{JSON.stringify(data.plan, null, 2)}</pre>
      </section>

      {data.results.content && (
        <section style={styles.card}>
          <h3 style={styles.h3}>Content Agent Output</h3>
          <p>{data.results.content.explanation}</p>
          {data.results.content.key_examples?.length > 0 && (
            <>
              <strong>Examples:</strong>
              <ul>
                {data.results.content.key_examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {data.results.assessment && (
        <section style={styles.card}>
          <h3 style={styles.h3}>Assessment Agent Output</h3>
          {data.results.assessment.questions?.map((q, i) => (
            <div key={i} style={styles.question}>
              <p>
                <strong>Q{i + 1} ({q.difficulty}):</strong> {q.question}
              </p>
              <ul>
                {q.rubric?.map((r, j) => (
                  <li key={j}>
                    {r.criterion} — {r.weight_percent}%
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {!feedbackGiven ? (
        <section style={styles.feedbackBox}>
          <p style={{ marginBottom: 10 }}>
            Did this explanation make sense to {learnerId || "the learner"}?
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{ ...styles.button, background: "#2e7d32", flex: 1 }}
              onClick={() => onFeedback("made_sense")}
            >
              ✅ Made sense
            </button>
            <button
              style={{ ...styles.button, background: "#b34747", flex: 1 }}
              onClick={() => onFeedback("struggled")}
            >
              ⚠️ Struggled with this
            </button>
          </div>
        </section>
      ) : (
        <p style={{ color: "#8fd6a0", fontSize: 14 }}>
          Thanks — saved to {learnerId}'s history. Next session will adapt based on this.
        </p>
      )}
    </div>
  );
}

const styles = {
  results: { display: "flex", flexDirection: "column", gap: 16 },
  planBox: { background: "#1a1d24", padding: 16, borderRadius: 10, border: "1px solid #2a2d34" },
  card: { background: "#15171c", padding: 16, borderRadius: 10, border: "1px solid #2a2d34", lineHeight: 1.6 },
  feedbackBox: { background: "#1a1d24", padding: 16, borderRadius: 10, border: "1px solid #2a2d34" },
  h3: { fontSize: 16, marginBottom: 8, color: "#c9c2ff" },
  pre: { fontSize: 12, whiteSpace: "pre-wrap", color: "#8fd6a0" },
  question: { marginBottom: 12, borderBottom: "1px solid #2a2d34", paddingBottom: 8 },
  button: { padding: "12px 16px", borderRadius: 8, border: "none", color: "#fff", fontSize: 15, cursor: "pointer" },
};