import { useState, useEffect } from "react";

const STEPS = [
  "🕵️ Manager is analyzing the request...",
  "✍️ Explainer is writing the lesson...",
  "📝 Quiz Maker is preparing questions...",
];

const STEP_DURATION = 1500; // ms each message stays visible
const FADE_DURATION = 400; // ms for the fade transition

export default function GeneratingStatus({ isLoading }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) return;

    // Reset to the first step each time loading starts
    setStepIndex(0);
    setVisible(true);

    let fadeTimer;
    const cycleTimer = setInterval(() => {
      // Fade the current message out...
      setVisible(false);
      // ...then swap to the next message and fade it back in
      fadeTimer = setTimeout(() => {
        setStepIndex((prev) => (prev + 1) % STEPS.length);
        setVisible(true);
      }, FADE_DURATION);
    }, STEP_DURATION);

    return () => {
      clearInterval(cycleTimer);
      clearTimeout(fadeTimer);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div style={styles.container}>
      <span style={styles.dot} />
      <span
        style={{
          ...styles.text,
          opacity: visible ? 1 : 0,
        }}
      >
        {STEPS[stepIndex]}
      </span>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#1a1d24",
    border: "1px solid #2a2d34",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#c9c2ff",
    flexShrink: 0,
  },
  text: {
    color: "#c9c2ff",
    fontSize: 14,
    transition: "opacity 0.4s ease",
  },
};