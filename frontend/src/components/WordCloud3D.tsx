import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { WordWeight, CloudLayout } from "../types";
import WordLabel from "./WordLabel";
import ErrorBoundary from "./ErrorBoundary";

// ── color gradient (indigo → violet → pink → amber) ──────────────────────────

function weightToColor(weight: number): string {
  const stops = [
    { t: 0.0,  r: 99,  g: 102, b: 241 },
    { t: 0.35, r: 139, g: 92,  b: 246 },
    { t: 0.65, r: 236, g: 72,  b: 153 },
    { t: 1.0,  r: 251, g: 191, b: 36  },
  ];
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (weight >= stops[i].t && weight <= stops[i + 1].t) {
      lo = stops[i]; hi = stops[i + 1]; break;
    }
  }
  const f = (weight - lo.t) / (hi.t - lo.t || 1);
  return `rgb(${Math.round(lo.r + (hi.r - lo.r) * f)},${Math.round(lo.g + (hi.g - lo.g) * f)},${Math.round(lo.b + (hi.b - lo.b) * f)})`;
}

// ── layout generators ─────────────────────────────────────────────────────────

function spherePositions(n: number, r = 4.5): [number, number, number][] {
  const g = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r2 = Math.sqrt(1 - y * y);
    return [r * r2 * Math.cos(g * i), r * y, r * r2 * Math.sin(g * i)];
  });
}

function helixPositions(n: number, r = 3.5): [number, number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / Math.max(n - 1, 1);
    const a = t * Math.PI * 8;
    return [r * Math.cos(a), (t - 0.5) * 10, r * Math.sin(a)];
  });
}

function flatPositions(n: number): [number, number, number][] {
  const ga = 2.399;
  return Array.from({ length: n }, (_, i) => {
    const r = Math.sqrt((i + 1) / n) * 7;
    const a = i * ga;
    return [r * Math.cos(a), r * Math.sin(a), (Math.random() - 0.5) * 0.4];
  });
}

// ── cloud group ───────────────────────────────────────────────────────────────

interface CloudGroupProps {
  words: WordWeight[];
  layout: CloudLayout;
  hoveredWord: string | null;
  onHoverWord: (word: string | null) => void;
}

function CloudGroup({ words, layout, hoveredWord, onHoverWord }: CloudGroupProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
  });

  const { positions, fontSizes, colors } = useMemo(() => {
    const pts =
      layout === "sphere" ? spherePositions(words.length) :
      layout === "helix"  ? helixPositions(words.length)  :
      /* flat */            flatPositions(words.length);
    return {
      positions: pts,
      fontSizes: words.map((w) => 0.12 + w.weight * 0.38),
      colors:    words.map((w) => weightToColor(w.weight)),
    };
  }, [words, layout]);

  return (
    <group ref={groupRef}>
      {words.map((w, i) => (
        <WordLabel
          key={w.word}
          data={w}
          position={positions[i]}
          fontSize={fontSizes[i]}
          color={colors[i]}
          index={i}
          isHighlighted={hoveredWord === w.word}
          onHover={onHoverWord}
        />
      ))}
    </group>
  );
}

// ── public component ──────────────────────────────────────────────────────────

interface Props {
  words: WordWeight[];
  layout: CloudLayout;
  hoveredWord: string | null;
  onHoverWord: (word: string | null) => void;
}

export default function WordCloud3D({ words, layout, hoveredWord, onHoverWord }: Props) {
  return (
    <ErrorBoundary>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ position: "absolute", inset: 0 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#070714"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <Stars radius={80} depth={50} count={4000} factor={4} saturation={0.5} fade />
        <CloudGroup
          words={words}
          layout={layout}
          hoveredWord={hoveredWord}
          onHoverWord={onHoverWord}
        />
        <OrbitControls enableZoom enablePan={false} minDistance={4} maxDistance={18} />
      </Canvas>
    </ErrorBoundary>
  );
}
