import { useEffect, useRef, useState } from "react";

let mermaidInstance = null;

export default function MermaidDiagram({ chart }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        if (!mermaidInstance) {
          const mod = await import("mermaid");
          mermaidInstance = mod.default;
          mermaidInstance.initialize({ startOnLoad: false, theme: "dark" });
        }
        const id = "mermaid-" + Math.random().toString(36).slice(2);
        const { svg: rendered } = await mermaidInstance.render(id, chart);
        if (!cancelled) setSvg(rendered);
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (!cancelled) setError(true);
      }
    }

    if (chart) render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error || !chart) return null; // fail silently — never break the rest of the page
  if (!svg) return <p style={{ fontSize: 13, color: "#888" }}>Rendering diagram...</p>;

  return (
    <div
      style={{ background: "#fff", borderRadius: 8, padding: 12, marginTop: 12, overflowX: "auto" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}