import { useState, useEffect } from "react";
import { WordWeight, ArticleMeta, AppState, CloudLayout } from "./types";
import UrlInput from "./components/UrlInput";
import WordCloud3D from "./components/WordCloud3D";
import WordList from "./components/WordList";
import StatsBar from "./components/StatsBar";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8001";

const LOADING_MESSAGES = ["Fetching article…", "Cleaning text…", "Extracting topics…", "Building word cloud…"];

const LAYOUTS: { key: CloudLayout; label: string; title: string }[] = [
  { key: "sphere", label: "Sphere", title: "Balanced 3D globe" },
  { key: "helix",  label: "Helix",  title: "Ranked spiral" },
  { key: "flat",   label: "Flat",   title: "2D overview" },
];

document.head.insertAdjacentHTML("beforeend", `<style>@keyframes spin{to{transform:rotate(360deg)}}</style>`);

export default function App() {
  const [state, setState] = useState<AppState>("idle");
  const [words, setWords] = useState<WordWeight[]>([]);
  const [meta, setMeta] = useState<ArticleMeta | null>(null);
  const [layout, setLayout] = useState<CloudLayout>("sphere");
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  // Cycle loading messages while fetching
  useEffect(() => {
    if (state !== "loading") return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 1800);
    return () => clearInterval(id);
  }, [state]);

  const analyze = async (url: string, topN: number) => {
    setState("loading");
    setLoadingMsg(LOADING_MESSAGES[0]);
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, top_n: topN }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setWords(data.words);
      setMeta(data.meta);
      setState("success");
    } catch {
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setWords([]);
    setMeta(null);
    setHoveredWord(null);
  };

  const showCloud = words.length > 0;

  return (
    <div style={root}>
      {showCloud
        ? <WordCloud3D words={words} layout={layout} hoveredWord={hoveredWord} onHoverWord={setHoveredWord} />
        : <div style={idleBg} />
      }

      {state === "loading" && words.length === 0 && (
        <div style={loadingOverlay}>
          <Spinner />
          <p style={loadingText}>{loadingMsg}</p>
        </div>
      )}

      <div style={topPanel}>
        <UrlInput onSubmit={analyze} state={state} />
        {meta && <StatsBar meta={meta} onReset={reset} />}
      </div>

      {showCloud && (
        <div style={layoutToggle}>
          {LAYOUTS.map((l) => (
            <button key={l.key} title={l.title}
              style={layout === l.key ? { ...layoutBtn, ...layoutBtnActive } : layoutBtn}
              onClick={() => setLayout(l.key)}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      {showCloud && <WordList words={words} hoveredWord={hoveredWord} onHover={setHoveredWord} />}
    </div>
  );
}

function Spinner() {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "4px solid #334155",
        borderTopColor: "#6366f1",
        animation: "spin 0.9s linear infinite",
      }}
    />
  );
}

const root: React.CSSProperties = {
  width: "100vw",
  height: "100vh",
  position: "relative",
  overflow: "hidden",
};

const idleBg: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(ellipse at 50% 60%, #0f0f2e 0%, #070714 70%)",
};

const loadingOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 20,
  background: "rgba(7,7,20,0.82)",
  zIndex: 5,
};

const loadingText: React.CSSProperties = {
  color: "#94a3b8",
  fontFamily: "system-ui, sans-serif",
  fontSize: "1rem",
};

const topPanel: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  pointerEvents: "none",
};

const layoutToggle: React.CSSProperties = {
  position: "absolute",
  bottom: 28,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 6,
  zIndex: 10,
};

const layoutBtn: React.CSSProperties = {
  padding: "6px 18px",
  borderRadius: 20,
  border: "1px solid #334155",
  background: "rgba(7,7,20,0.8)",
  color: "#94a3b8",
  fontSize: "0.82rem",
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
};

const layoutBtnActive: React.CSSProperties = {
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  border: "1px solid transparent",
  color: "#fff",
};
