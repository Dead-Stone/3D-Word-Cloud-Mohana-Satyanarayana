import { WordWeight } from "../types";

interface Props {
  words: WordWeight[];
  hoveredWord: string | null;
  onHover: (word: string | null) => void;
}

export default function WordList({ words, hoveredWord, onHover }: Props) {
  return (
    <div style={container}>
      <div style={header}>
        <span style={headerTitle}>Top Topics</span>
        <span style={countBadge}>{words.length}</span>
      </div>
      <div style={list}>
        {words.map((w, i) => (
          <div
            key={w.word}
            style={{ ...row, background: hoveredWord === w.word ? "#1e293b" : "transparent" }}
            onMouseEnter={() => onHover(w.word)}
            onMouseLeave={() => onHover(null)}
          >
            <span style={rank}>{i + 1}</span>
            <div style={wordCol}>
              <span style={wordText}>{w.word}</span>
              <div style={barTrack}>
                <div style={{ ...barFill, width: `${w.weight * 100}%` }} />
              </div>
            </div>
            <span style={pct}>{Math.round(w.weight * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  position: "absolute",
  right: 0, top: 0, bottom: 0,
  width: 220,
  background: "rgba(7,7,20,0.88)",
  borderLeft: "1px solid #1e293b",
  display: "flex",
  flexDirection: "column",
  zIndex: 10,
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 14px 10px",
  borderBottom: "1px solid #1e293b",
  flexShrink: 0,
};

const headerTitle: React.CSSProperties = {
  color: "#e2e8f0",
  fontFamily: "system-ui, sans-serif",
  fontSize: "0.85rem",
  fontWeight: 600,
};

const countBadge: React.CSSProperties = {
  color: "#64748b",
  fontFamily: "system-ui, sans-serif",
  fontSize: "0.75rem",
  background: "#1e293b",
  padding: "1px 7px",
  borderRadius: 20,
};

const list: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "6px 4px",
};

const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 6,
  margin: "1px 0",
  transition: "background 0.15s",
};

const rank: React.CSSProperties = {
  color: "#475569",
  fontFamily: "system-ui, sans-serif",
  fontSize: "0.7rem",
  width: 18,
  textAlign: "right",
  flexShrink: 0,
};

const wordCol: React.CSSProperties = { flex: 1, minWidth: 0 };

const wordText: React.CSSProperties = {
  color: "#cbd5e1",
  fontFamily: "system-ui, sans-serif",
  fontSize: "0.82rem",
  display: "block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  marginBottom: 3,
};

const barTrack: React.CSSProperties = { height: 3, background: "#1e293b", borderRadius: 2 };

const barFill: React.CSSProperties = {
  height: "100%",
  background: "linear-gradient(to right, #6366f1, #ec4899)",
  borderRadius: 2,
  transition: "width 0.4s ease",
};

const pct: React.CSSProperties = {
  color: "#64748b",
  fontFamily: "system-ui, sans-serif",
  fontSize: "0.7rem",
  flexShrink: 0,
};
