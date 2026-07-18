import { useState, useEffect } from "react";
import MermaidDiagram from "./MermaidDiagram";
import { colors, fonts, agentColor, tint } from "../lib/theme";

const AGENT_SEQUENCE = [
  { key: "orchestrator", label: "Orchestrator" },
  { key: "curriculum", label: "Curriculum" },
  { key: "content", label: "Content" },
  { key: "storytelling", label: "Storytelling" },
  { key: "assessment", label: "Assessment" },
];

function AgentPipeline({ agentsUsed }) {
  return (
    <div style={pipelineStyles.row}>
      {AGENT_SEQUENCE.map((agent, i) => {
        const active = agentsUsed.includes(agent.key);
        const color = agentColor(agent.key);
        return (
          <div key={agent.key} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                ...pipelineStyles.node,
                background: active ? color : "transparent",
                border: `1.5px solid ${active ? color : colors.border}`,
                color: active ? "#0d0e14" : colors.textMuted,
              }}
            >
              {agent.label}
            </div>
            {i < AGENT_SEQUENCE.length - 1 && (
              <div style={{ ...pipelineStyles.line, background: active ? color : colors.border }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ agentKey, title, icon, children }) {
  const color = agentColor(agentKey);
  return (
    <section
      style={{
        ...cardBase,
        background: tint(color, 0.06),
        border: `1px solid ${tint(color, 0.25)}`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span
          style={{
            fontSize: 13,
            padding: "4px 10px",
            borderRadius: 20,
            background: tint(color, 0.18),
            color,
            fontFamily: fonts.mono,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          {icon} {agentKey.toUpperCase()}
        </span>
      </div>
      <h3 style={cardTitle}>{title}</h3>
      {children}
    </section>
  );
}

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
  const agentsUsed = ["orchestrator", ...(data.plan.agents_needed || [])];

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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...cardBase, padding: "16px 20px" }}>
        <span style={{ ...cardEyebrow, color: colors.textMuted, marginBottom: 10, display: "block" }}>
          Agent Pipeline for This Request
        </span>
        <AgentPipeline agentsUsed={agentsUsed} />
      </div>

      <SectionCard agentKey="orchestrator" title="Live Decision" icon="🧭">
        <pre style={preStyle}>{JSON.stringify(data.plan, null, 2)}</pre>
      </SectionCard>

      {data.curriculum && (
        <SectionCard agentKey="curriculum" title="Lesson Sequence" icon="🗺️">
          <p style={{ marginBottom: 14, color: colors.textSecondary, fontSize: 14 }}>
            This topic was broad, so it was broken down:
          </p>
          <div style={flowStyles.row}>
            {data.curriculum.sequence?.map((s, i) => {
              const isFocus = s === data.curriculum.focus_subtopic;
              const color = agentColor("curriculum");
              return (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      ...flowStyles.node,
                      background: isFocus ? color : colors.bg,
                      borderColor: isFocus ? color : colors.border,
                      color: isFocus ? "#0d0e14" : colors.textPrimary,
                      fontWeight: isFocus ? 700 : 400,
                    }}
                  >
                    {s}
                    {isFocus && <div style={flowStyles.badge}>teaching now</div>}
                  </div>
                  {i < data.curriculum.sequence.length - 1 && (
                    <div style={{ ...flowStyles.arrow, color: colors.textMuted }}>→</div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 13, color: colors.textMuted, marginTop: 14 }}>
            {data.curriculum.reasoning}
          </p>
        </SectionCard>
      )}

      {data.results.content && (
        <SectionCard agentKey="content" title="Explanation" icon="✍️">
          <p style={{ lineHeight: 1.7, color: colors.textPrimary, fontSize: 15 }}>
            {data.results.content.explanation}
          </p>
          {data.results.content.key_examples?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ color: colors.textSecondary, fontSize: 13 }}>Examples</strong>
              <ul style={{ marginTop: 6 }}>
                {data.results.content.key_examples.map((ex, i) => (
                  <li key={i} style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>{ex}</li>
                ))}
              </ul>
            </div>
          )}
          {data.results.content.diagram_mermaid && (
            <div style={{ marginTop: 16, borderRadius: 10, overflow: "hidden", border: `1px solid ${colors.border}` }}>
              <MermaidDiagram chart={data.results.content.diagram_mermaid} />
            </div>
          )}
          {data.results.content.table_rows?.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table style={tableStyles.table}>
                <thead>
                  <tr>
                    {data.results.content.table_headers.map((h, i) => (
                      <th key={i} style={tableStyles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.results.content.table_rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={tableStyles.td}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {data.results.storytelling?.story && (
        <SectionCard agentKey="storytelling" title="Story Version" icon="📖">
          <p style={{ fontStyle: "italic", lineHeight: 1.7, color: colors.textPrimary, fontSize: 15 }}>
            {data.results.storytelling.story}
          </p>
        </SectionCard>
      )}

      {questions.length > 0 && (
        <SectionCard agentKey="assessment" title="Pick an Answer" icon="📝">
          {questions.map((q, qi) => (
            <div key={qi} style={{ marginBottom: 18, borderBottom: `1px solid ${colors.border}`, paddingBottom: 14 }}>
              <p style={{ color: colors.textPrimary, fontSize: 14, marginBottom: 8 }}>
                <strong>Q{qi + 1} ({q.difficulty}):</strong> {q.question}
              </p>
              {q.options.map((opt, oi) => {
                const isSelected = selected[qi] === oi;
                const isCorrect = q.correct_index === oi;
                let bg = colors.bg;
                let border = colors.border;
                if (graded && isCorrect) { bg = "#16302a"; border = colors.assessment; }
                else if (graded && isSelected && !isCorrect) { bg = "#331c1c"; border = colors.error; }
                else if (isSelected) { bg = colors.bgCardAlt; border = colors.assessment; }

                return (
                  <div
                    key={oi}
                    onClick={() => handleSelect(qi, oi)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      marginTop: 8,
                      cursor: graded ? "default" : "pointer",
                      border: `1px solid ${border}`,
                      background: bg,
                      color: colors.textPrimary,
                      fontSize: 14,
                    }}
                  >
                    {opt}
                    {graded && isCorrect ? " ✅" : ""}
                    {graded && isSelected && !isCorrect ? " ❌" : ""}
                  </div>
                );
              })}
              {graded && (
                <p style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>
                  {q.explanation}
                </p>
              )}
            </div>
          ))}

          {!graded ? (
            <button onClick={handleSubmit} style={buttonStyle}>
              Submit for Grading
            </button>
          ) : (
            <div style={{ marginTop: 16, padding: 16, background: colors.bg, borderRadius: 10, border: `1px solid ${colors.assessment}` }}>
              <h4 style={{ color: colors.assessment, marginBottom: 6, fontFamily: fonts.display }}>
                {result.overallScore}/100 ({result.correctCount}/{result.total} correct) — {result.demonstratedLevel}
              </h4>
              <p style={{ fontSize: 14, color: colors.textSecondary }}>{result.summary}</p>
              <p style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
                Saved to {learnerId}'s history — next session adapts based on this real result.
              </p>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}

const cardBase = {
  background: colors.bgCard,
  border: `1px solid ${colors.border}`,
  borderRadius: 14,
  padding: 20,
};
const cardEyebrow = {
  fontFamily: fonts.mono,
  fontSize: 11,
  letterSpacing: 1.2,
  fontWeight: 500,
};
const cardTitle = {
  fontFamily: fonts.display,
  fontSize: 17,
  fontWeight: 700,
  color: colors.textPrimary,
  margin: "2px 0 12px",
};
const preStyle = {
  fontFamily: fonts.mono,
  fontSize: 12,
  whiteSpace: "pre-wrap",
  color: colors.textSecondary,
  background: colors.bg,
  padding: 12,
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
};
const buttonStyle = {
  marginTop: 8,
  padding: "12px 18px",
  borderRadius: 8,
  border: "none",
  background: colors.assessment,
  color: "#0d0e14",
  fontFamily: fonts.display,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

const pipelineStyles = {
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0 },
  node: {
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontFamily: fonts.mono,
    fontWeight: 600,
  },
  line: { width: 20, height: 2 },
};

const flowStyles = {
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4 },
  node: { padding: "10px 14px", borderRadius: 10, border: "1px solid", fontSize: 13, position: "relative", whiteSpace: "nowrap" },
  arrow: { fontSize: 18, padding: "0 4px" },
  badge: { fontSize: 10, marginTop: 4, fontWeight: 400 },
};

const tableStyles = {
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "8px 10px", background: colors.bg, color: colors.content, borderBottom: `2px solid ${colors.border}` },
  td: { padding: "8px 10px", borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary },
};