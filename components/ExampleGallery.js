export default function ExampleGallery({ onSelectExample }) {
  const examples = [
    {
      title: "Recursion for a CS student",
      description: "Learn recursion using simple programming examples.",
      topic: "recursion",
      learnerContext:
        "2nd-year CS student who knows loops but not recursion",
      board: "CBSE Class 12 Computer Science",
    },
    {
      title: "Photosynthesis for a young learner",
      description: "Understand how plants make food.",
      topic: "photosynthesis",
      learnerContext:
        "Class 5 student who finds science difficult",
      board: "CBSE Class 5",
    },
    {
      title: "Fractions for a beginner",
      description: "Master the basics of fractions.",
      topic: "fractions",
      learnerContext:
        "Class 6 student just starting fractions",
      board: "ICSE Class 6",
    },
  ];

  const styles = {
    container: {
      display: "flex",
      flexWrap: "wrap",
      gap: 20,
      marginBottom: 24,
    },
    card: {
      flex: "1 1 200px",
      background: "#1a1d24",
      border: "1px solid #2a2d34",
      borderRadius: 12,
      padding: 16,
      cursor: "pointer",
      transition: "0.2s",
    },
    title: {
      fontWeight: "bold",
      marginBottom: 8,
      color: "#fff",
    },
    desc: {
      color: "#aaa",
      fontSize: 14,
    },
  };

  return (
    <div style={styles.container}>
      {examples.map((example) => (
        <div
          key={example.title}
          style={styles.card}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#252a33")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#1a1d24")
          }
          onClick={() =>
            onSelectExample({
              topic: example.topic,
              learnerContext: example.learnerContext,
              board: example.board,
            })
          }
        >
          <div style={styles.title}>{example.title}</div>
          <div style={styles.desc}>{example.description}</div>
        </div>
      ))}
    </div>
  );
}