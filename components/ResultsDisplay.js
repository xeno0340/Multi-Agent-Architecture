import React from 'react';

export default function ResultsDisplay({ data, learnerId, feedbackGiven, onFeedback }) {
  if (!data) return null;

  return (
    <div style={styles.results} aria-live="polite">
      <section style={styles.planBox} aria-labelledby="orchestrator-heading">
        <h3 id="orchestrator-heading" style={styles.h3}>
          Orchestrator Plan <span style={styles.badge}>Live Decision</span>
        </h3>
        <pre style={styles.pre}>{JSON.stringify(data.plan, null, 2)}</pre>
      </section>

      {data.results.content && (
        <section style={styles.card} aria-labelledby="content-heading">
          <h3 id="content-heading" style={styles.h3}>Content Agent Output</h3>
          <p style={styles.paragraph}>{data.results.content.explanation}</p>
          {data.results.content.key_examples?.length > 0 && (
            <div style={styles.examplesWrapper}>
              <strong style={styles.strong}>Examples:</strong>
              <ul style={styles.list}>
                {data.results.content.key_examples.map((ex, i) => (
                  <li key={i} style={styles.listItem}>{ex}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {data.results.assessment && (
        <section style={styles.card} aria-labelledby="assessment-heading">
          <h3 id="assessment-heading" style={styles.h3}>Assessment Agent Output</h3>
          {data.results.assessment.questions?.map((q, i) => (
            <div key={i} style={styles.question}>
              <p style={styles.paragraph}>
                <strong style={styles.strong}>
                  Q{i + 1} <span style={styles.difficultyBadge}>({q.difficulty})</span>:
                </strong> {q.question}
              </p>
              <ul style={styles.list}>
                {q.rubric?.map((r, j) => (
                  <li key={j} style={styles.listItem}>
                    <span style={styles.criterion}>{r.criterion}</span> — <span style={styles.weight}>{r.weight_percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {!feedbackGiven ? (
        <section style={styles.feedbackBox} aria-labelledby="feedback-heading">
          <h3 id="feedback-heading" style={styles.visuallyHidden}>Provide Feedback</h3>
          <p style={styles.feedbackText}>
            Did this explanation make sense to <strong style={styles.strong}>{learnerId || "the learner"}</strong>?
          </p>
          <div style={styles.buttonGroup}>
            <button
              style={{ ...styles.button, ...styles.buttonSuccess }}
              onClick={() => onFeedback("made_sense")}
              aria-label="Mark explanation as made sense"
            >
              ✅ Made sense
            </button>
            <button
              style={{ ...styles.button, ...styles.buttonWarning }}
              onClick={() => onFeedback("struggled")}
              aria-label="Mark explanation as struggled"
            >
              ⚠️ Struggled with this
            </button>
          </div>
        </section>
      ) : (
        <div style={styles.successMessage} role="status">
          <p style={{ margin: 0 }}>
            ✅ Thanks — saved to {learnerId}'s history. Next session will adapt based on this.
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  results: { 
    display: "flex", 
    flexDirection: "column", 
    gap: '24px', 
    marginTop: '32px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  planBox: { 
    background: "#0d1117", 
    padding: '24px', 
    borderRadius: '12px', 
    border: "1px solid #30363d",
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  card: { 
    background: "#161b22", 
    padding: '24px', 
    borderRadius: '12px', 
    border: "1px solid #30363d", 
    lineHeight: 1.6,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  feedbackBox: { 
    background: "#1f242c", 
    padding: '24px', 
    borderRadius: '12px', 
    border: "1px solid #444c56",
    textAlign: 'center'
  },
  h3: { 
    fontSize: '1.15rem', 
    marginBottom: '16px', 
    color: "#58a6ff", 
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: 0
  },
  badge: {
    fontSize: '0.75rem',
    background: '#238636',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: 'normal'
  },
  pre: { 
    fontSize: '0.85rem', 
    whiteSpace: "pre-wrap", 
    color: "#7ee787", 
    background: '#0a0c10',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #2ea04333',
    margin: 0,
    fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace'
  },
  paragraph: {
    color: '#c9d1d9',
    fontSize: '1rem',
    marginBottom: '16px',
    marginTop: 0
  },
  examplesWrapper: {
    background: '#0d1117',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #30363d'
  },
  strong: {
    color: '#f0f6fc',
    fontWeight: '600'
  },
  list: {
    margin: '12px 0 0 0',
    paddingLeft: '24px',
    color: '#c9d1d9'
  },
  listItem: {
    marginBottom: '8px'
  },
  question: { 
    marginBottom: '20px', 
    borderBottom: "1px solid #30363d", 
    paddingBottom: '20px',
  },
  difficultyBadge: {
    color: '#d2a8ff',
    fontWeight: 'normal',
    fontSize: '0.9rem'
  },
  criterion: {
    color: '#c9d1d9'
  },
  weight: {
    color: '#58a6ff',
    fontWeight: '600'
  },
  feedbackText: { 
    marginBottom: '20px',
    color: '#c9d1d9',
    fontSize: '1.05rem'
  },
  buttonGroup: { 
    display: "flex", 
    gap: '16px',
    justifyContent: 'center'
  },
  button: { 
    padding: "12px 24px", 
    borderRadius: '8px', 
    border: "none", 
    color: "#ffffff", 
    fontSize: '1rem',
    fontWeight: '600',
    cursor: "pointer",
    flex: 1,
    maxWidth: '200px',
    outlineOffset: '2px' 
  },
  buttonSuccess: {
    background: "#238636",
    boxShadow: '0 2px 0 #185c25'
  },
  buttonWarning: {
    background: "#da3633",
    boxShadow: '0 2px 0 #b32d2a'
  },
  successMessage: { 
    color: "#3fb950", 
    fontSize: '1rem',
    background: '#0d1117',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #2ea043',
    textAlign: 'center',
    fontWeight: '500'
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    border: 0
  }
};