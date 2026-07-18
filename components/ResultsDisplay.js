import { useState, useEffect } from "react";
import MermaidDiagram from "./MermaidDiagram";

export default function ResultsDisplay({ data, learnerId, topic, onGraded }) {
  const [selected, setSelected] = useState({});
  const [graded, setGraded] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setSelected({});
    setGraded(false);
    setResult(null);
  }, [data]);

  if (!data) return null;

  const questions = data.results.assessment?.questions || [];

  function handleSelect(qIndex, optionIndex) {
    if (graded) return;
    setSelected((prev) => ({ ...prev, [qIndex]: optionIndex }));
  }

  function handleSubmit() {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (selected[i] === q.correct_index) correctCount++;
    });

    const overallScore = Math.round((correctCount / questions.length) * 100);
    let demonstratedLevel = "beginner";
    if (overallScore >= 80) demonstratedLevel = "advanced";
    else if (overallScore >= 50) demonstratedLevel = "intermediate";

    const summary =
      overallScore === 100
        ? "Perfect score — ready to move to a harder difficulty next time."
        : overallScore >= 50
        ? "Solid understanding, with some gaps worth reviewing."
        : "This topic needs more foundational review before moving forward.";

    const gradingResult = { correctCount, total: questions.length, overallScore, demonstratedLevel, summary };
    setResult(gradingResult);
    setGraded(true);

    if (learnerId && onGraded) {
      onGraded({
        topic: data.focusTopic || topic,
        difficulty: demonstratedLevel,
        feedback: `scored ${overallScore}/100 (${correctCount}/${questions.length} correct) — actual demonstrated performance`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return (
    <div style={styles.results}>
      <section style={styles.planBox}>
        <h3 style={styles.h3}>Orchestrator Plan (live decision)</h3>
        <pre style={styles.pre}>{JSON.stringify(data.plan, null, 2)}</pre>
      </section>

      {data.curriculum && (
        <section style={styles.card}>
          <h3 style={styles.h3}>Curriculum Agent Output</h3>
          <p style={{ marginBottom: 14 }}>
            This topic was broad, so it was broken into a sequence:
          </p>
          <div style={styles.flowchart}>
            {data.curriculum.sequence?.map((s, i) => {
              const isFocus = s === data.curriculum.focus_subtopic;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      ...styles.flowNode,
                      background: isFocus ? "#7c5cff" : "#1a1d24",
                      borderColor: isFocus ? "#7c5cff" : "#2a2d34",
                      color: isFocus ? "#fff" : "#e6e6e6",
                      fontWeight: isFocus ? "bold" : "normal",
                    }}
                  >
                    {s}
                    {isFocus && <div style={styles.flowBadge}>teaching now</div>}
                  </div>
                  {i < data.curriculum.sequence.length - 1 && (
                    <div style={styles.flowArrow}>→</div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 13, color: "#a0a0a0", marginTop: 14 }}>
            {data.curriculum.reasoning}
          </p>
        </section>
      )}

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
          {data.results.content.diagram_mermaid && (
            <MermaidDiagram chart={data.results.content.diagram_mermaid} />
          )}
        </section>
      )}

      {questions.length > 0 && (
        <section style={styles.card}>
          <h3 style={styles.h3}>Assessment — Pick an Answer</h3>
          {questions.map((q, qi) => (
            <div key={qi} style={styles.question}>
              <p>
                <strong>Q{qi + 1} ({q.difficulty}):</strong> {q.question}
              </p>
              {q.options.map((opt, oi) => {
                const isSelected = selected[qi] === oi;
                const isCorrect = q.correct_index === oi;
                let bg = "#1a1d24";
                if (graded && isCorrect) bg = "#1f3d24";
                else if (graded && isSelected && !isCorrect) bg = "#3d1f1f";
                else if (isSelected) bg = "#2a2440";

                return (
                  <div
                    key={oi}
                    onClick={() => handleSelect(qi, oi)}
                    style={{ ...styles.option, background: bg }}
                  >
                    {opt}
                    {graded && isCorrect ? " ✅" : ""}
                    {graded && isSelected && !isCorrect ? " ❌" : ""}
                  </div>
                );
              })}
              {graded && (
                <p style={{ fontSize: 13, color: "#a0a0a0", marginTop: 6 }}>
                  {q.explanation}
                </p>
              )}
            </div>
          ))}

          {!graded ? (
            <button style={styles.button} onClick={handleSubmit}>
              Submit for Grading
            </button>
          ) : (
            <div style={styles.overallBox}>
              <h4 style={{ color: "#c9c2ff", marginBottom: 6 }}>
                Overall: {result.overallScore}/100 ({result.correctCount}/{result.total}{" "}
                correct) — Demonstrated level: {result.demonstratedLevel}
              </h4>
              <p style={{ fontSize: 14 }}>{result.summary}</p>
              <p style={{ color: "#8fd6a0", fontSize: 13, marginTop: 8 }}>
                Saved to {learnerId}'s history — next session will adapt based on this
                real result, even if you describe yourself differently next time.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

const styles = {
  results: { display: "flex", flexDirection: "column", gap: 16 },
  planBox: { background: "#1a1d24", padding: 16, borderRadius: 10, border: "1px solid #2a2d34" },
  card: { background: "#15171c", padding: 16, borderRadius: 10, border: "1px solid #2a2d34", lineHeight: 1.6 },
  h3: { fontSize: 16, marginBottom: 8, color: "#c9c2ff" },
  pre: { fontSize: 12, whiteSpace: "pre-wrap", color: "#8fd6a0" },
  question: { marginBottom: 16, borderBottom: "1px solid #2a2d34", paddingBottom: 12 },
  option: {
    padding: "10px 12px",
    borderRadius: 8,
    marginTop: 8,
    cursor: "pointer",
    border: "1px solid #2a2d34",
  },
  overallBox: { marginTop: 16, padding: 14, background: "#1a1d24", borderRadius: 10, border: "1px solid #2a2d34" },
  button: { marginTop: 12, padding: "12px 16px", borderRadius: 8, border: "none", background: "#7c5cff", color: "#fff", fontSize: 15, cursor: "pointer" },
  flowchart: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 },
  flowNode: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid",
    fontSize: 13,
    position: "relative",
    whiteSpace: "nowrap",
  },
  flowArrow: { fontSize: 18, color: "#666", padding: "0 4px" },
  flowBadge: {
    fontSize: 10,
    color: "#c9c2ff",
    marginTop: 4,
    fontWeight: "normal",
  },
};