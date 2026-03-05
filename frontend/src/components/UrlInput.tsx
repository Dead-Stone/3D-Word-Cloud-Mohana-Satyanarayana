import { useState } from "react";
import { AppState } from "../types";

const SAMPLE_URLS = [
  {
    label: "BBC – Artificial Intelligence",
    url: "https://www.bbc.com/news/technology-65855333",
  },
  {
    label: "NASA – 2023 Hottest Year",
    url: "https://climate.nasa.gov/news/3301/2023-was-the-hottest-year-on-record/",
  },
  {
    label: "Wikipedia – Quantum Computing",
    url: "https://en.wikipedia.org/wiki/Quantum_computing",
  },
];

const TOP_N_OPTIONS = [20, 40, 60, 80];

interface Props {
  onSubmit: (url: string, topN: number) => void;
  state: AppState;
}

export default function UrlInput({ onSubmit, state }: Props) {
  const [url, setUrl] = useState("");
  const [topN, setTopN] = useState(60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed, topN);
  };

  const isLoading = state === "loading";

  return (
    <div style={wrapper}>
      <h1 style={title}>3D Word Cloud</h1>
      <p style={subtitle}>Paste a news article URL to visualize its topics</p>

      <form onSubmit={handleSubmit} style={form}>
        <input
          style={input}
          type="url"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          required
        />
        <button style={button} type="submit" disabled={isLoading}>
          {isLoading ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      <div style={controls}>
        <div style={samples}>
          <span style={samplesLabel}>Try a sample:</span>
          {SAMPLE_URLS.map((s) => (
            <button
              key={s.url}
              style={sampleBtn}
              onClick={() => {
                setUrl(s.url);
                onSubmit(s.url, topN);
              }}
              disabled={isLoading}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={topNRow}>
          <span style={samplesLabel}>Words:</span>
          {TOP_N_OPTIONS.map((n) => (
            <button
              key={n}
              style={topN === n ? { ...sampleBtn, ...sampleBtnActive } : sampleBtn}
              onClick={() => setTopN(n)}
              disabled={isLoading}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {state === "error" && (
        <p style={error}>Failed to analyze the article. Check the URL and try again.</p>
      )}
    </div>
  );
}

const wrapper: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "28px 16px 16px",
  background: "linear-gradient(to bottom, rgba(7,7,20,0.95) 70%, transparent)",
  pointerEvents: "auto",
};

const title: React.CSSProperties = {
  color: "#e2e8f0",
  fontSize: "2rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  fontFamily: "'Segoe UI', system-ui, sans-serif",
  marginBottom: 4,
};

const subtitle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "0.95rem",
  marginBottom: 20,
  fontFamily: "system-ui, sans-serif",
};

const form: React.CSSProperties = {
  display: "flex",
  gap: 10,
  width: "100%",
  maxWidth: 620,
};

const input: React.CSSProperties = {
  flex: 1,
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: "system-ui, sans-serif",
};

const button: React.CSSProperties = {
  padding: "10px 22px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "#fff",
  fontWeight: 600,
  fontSize: "0.95rem",
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  whiteSpace: "nowrap",
};

const controls: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  marginTop: 14,
};

const samples: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "center",
  justifyContent: "center",
};

const topNRow: React.CSSProperties = {
  display: "flex",
  gap: 6,
  alignItems: "center",
};

const samplesLabel: React.CSSProperties = {
  color: "#64748b",
  fontSize: "0.82rem",
  fontFamily: "system-ui, sans-serif",
};

const sampleBtn: React.CSSProperties = {
  padding: "5px 12px",
  borderRadius: 20,
  border: "1px solid #334155",
  background: "transparent",
  color: "#94a3b8",
  fontSize: "0.82rem",
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
};

const sampleBtnActive: React.CSSProperties = {
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  border: "1px solid transparent",
  color: "#fff",
};

const error: React.CSSProperties = {
  marginTop: 14,
  color: "#f87171",
  fontSize: "0.88rem",
  fontFamily: "system-ui, sans-serif",
};
