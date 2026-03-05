import { ArticleMeta } from "../types";

interface Props {
  meta: ArticleMeta;
  onReset: () => void;
}

export default function StatsBar({ meta, onReset }: Props) {
  return (
    <div style={wrapper}>
      <span style={title}>{meta.title}</span>
      <div style={pills}>
        <Pill label={meta.domain} />
        <Pill label={`${meta.word_count.toLocaleString()} words`} />
        <Pill label={`${meta.processing_time_ms} ms`} />
      </div>
      <button style={resetBtn} onClick={onReset}>
        ✕ Reset
      </button>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return <span style={pill}>{label}</span>;
}

const wrapper: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 10,
  padding: "8px 16px",
  background: "rgba(15,23,42,0.85)",
  borderRadius: 12,
  border: "1px solid #1e293b",
  maxWidth: 620,
  width: "100%",
  pointerEvents: "auto",
};

const title: React.CSSProperties = {
  color: "#e2e8f0",
  fontSize: "0.82rem",
  fontFamily: "system-ui, sans-serif",
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const pills: React.CSSProperties = {
  display: "flex",
  gap: 6,
  flexShrink: 0,
};

const pill: React.CSSProperties = {
  padding: "2px 10px",
  borderRadius: 20,
  background: "#1e293b",
  color: "#94a3b8",
  fontSize: "0.75rem",
  fontFamily: "system-ui, sans-serif",
  whiteSpace: "nowrap",
};

const resetBtn: React.CSSProperties = {
  padding: "4px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "transparent",
  color: "#64748b",
  fontSize: "0.78rem",
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  flexShrink: 0,
};
