import React from 'react';

export default function LearnerForm({
  learnerId, setLearnerId,
  board, setBoard,
  topic, setTopic,
  learnerContext, setLearnerContext,
  loading, onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} style={styles.form} aria-label="Learner Configuration Form">
      <label htmlFor="learnerIdInput" style={styles.label}>
        Learner name <span style={styles.subtext}>(used to remember their history on this device)</span>
      </label>
      <input
        id="learnerIdInput"
        style={styles.input}
        placeholder="e.g. Rahul"
        value={learnerId}
        onChange={(e) => setLearnerId(e.target.value)}
        required
        aria-required="true"
      />

      <label htmlFor="boardInput" style={styles.label}>
        Board & Class <span style={styles.subtext}>(optional — for curriculum alignment)</span>
      </label>
      <input
        id="boardInput"
        style={styles.input}
        placeholder="e.g. CBSE Class 10, ICSE Class 8, or leave blank"
        value={board}
        onChange={(e) => setBoard(e.target.value)}
      />

      <label htmlFor="topicInput" style={styles.label}>Topic</label>
      <input
        id="topicInput"
        style={styles.input}
        placeholder="e.g. Recursion, Photosynthesis, Fractions"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        required
        aria-required="true"
      />

      <label htmlFor="contextInput" style={styles.label}>Learner context</label>
      <input
        id="contextInput"
        style={styles.input}
        placeholder="e.g. 2nd-year CS student who knows loops but not recursion"
        value={learnerContext}
        onChange={(e) => setLearnerContext(e.target.value)}
        required
        aria-required="true"
      />

      <button 
        style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button} 
        disabled={loading} 
        type="submit"
        aria-busy={loading}
      >
        {loading ? "Orchestrating agents..." : "Generate"}
      </button>
    </form>
  );
}

const styles = {
  form: { 
    display: "flex", 
    flexDirection: "column", 
    gap: '12px', 
    marginBottom: '24px',
    background: '#161b22',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #30363d',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  label: { 
    fontSize: '0.95rem', 
    color: "#c9d1d9", // WCAG AA compliant text color
    marginTop: '8px',
    fontWeight: '600'
  },
  subtext: {
    fontSize: '0.85rem',
    fontWeight: '400',
    color: '#8b949e', 
  },
  input: { 
    padding: "12px 16px", 
    borderRadius: '8px', 
    border: "1px solid #30363d", 
    background: "#0d1117", 
    color: "#f0f6fc", 
    fontSize: '1rem',
    outlineOffset: '2px' // Ensures keyboard focus ring is highly visible
  },
  button: { 
    marginTop: '24px', 
    padding: "14px 16px", 
    borderRadius: '8px', 
    border: "none", 
    background: "#238636", // High contrast accessible green
    color: "#ffffff", 
    fontSize: '1rem', 
    fontWeight: '600',
    cursor: "pointer",
    outlineOffset: '2px',
    boxShadow: '0 2px 0 #185c25' // Subtle 3D pop
  },
  buttonDisabled: {
    background: '#216e39',
    opacity: 0.7,
    cursor: 'not-allowed',
    boxShadow: 'none'
  }
};