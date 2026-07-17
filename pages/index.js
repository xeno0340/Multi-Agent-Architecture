import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [learnerContext, setLearnerContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, learnerContext }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Multi-Agent Personalized Learning — MVP</h1>
        <p style={styles.sub}>
          Enter a topic and a learner's context. The orchestrator decides which
          agents to invoke and how to calibrate them — live, per request.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
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

        {error && <div style={styles.error}>{error}</div>}

        {data && (
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
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0f1115", color: "#e6e6e6", fontFamily: "system-ui, sans-serif", padding: "40px 16px" },
  container: { maxWidth: 720, margin: "0 auto" },
  h1: { fontSize: 26, marginBottom: 8 },
  sub: { color: "#a0a0a0", marginBottom: 24, lineHeight: 1.5 },
  form: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 },
  label: { fontSize: 13, color: "#b0b0b0", marginTop: 8 },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#1a1d24", color: "#fff", fontSize: 15 },
  button: { marginTop: 16, padding: "12px 16px", borderRadius: 8, border: "none", background: "#7c5cff", color: "#fff", fontSize: 15, cursor: "pointer" },
  error: { background: "#3a1a1a", color: "#ff8080", padding: 12, borderRadius: 8, marginBottom: 16 },
  results: { display: "flex", flexDirection: "column", gap: 16 },
  planBox: { background: "#1a1d24", padding: 16, borderRadius: 10, border: "1px solid #2a2d34" },
  card: { background: "#15171c", padding: 16, borderRadius: 10, border: "1px solid #2a2d34", lineHeight: 1.6 },
  h3: { fontSize: 16, marginBottom: 8, color: "#c9c2ff" },
  pre: { fontSize: 12, whiteSpace: "pre-wrap", color: "#8fd6a0" },
  question: { marginBottom: 12, borderBottom: "1px solid #2a2d34", paddingBottom: 8 },
};