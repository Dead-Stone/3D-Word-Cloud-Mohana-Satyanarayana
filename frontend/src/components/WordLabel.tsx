import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { WordWeight } from "../types";

interface Props {
  data: WordWeight;
  position: [number, number, number];
  color: string;
  fontSize: number;
  index: number;
  isHighlighted: boolean;
  onHover: (word: string | null) => void;
}

const STAGGER = 0.025;
const LERP_SPEED = 2.6;

export default function WordLabel({ data, position, color, fontSize, index, isHighlighted, onHover }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const mountTime = useRef<number | null>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (mountTime.current === null) mountTime.current = state.clock.elapsedTime;
    if (state.clock.elapsedTime - mountTime.current < index * STAGGER) return;

    currentPos.current.lerp(new THREE.Vector3(...position), Math.min(1, delta * LERP_SPEED));
    groupRef.current.position.copy(currentPos.current);
    groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + index * 0.7) * 0.04;

    const s = hovered || isHighlighted ? 1.3 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.12);
  });

  return (
    <group ref={groupRef}>
      <Text
        fontSize={fontSize}
        color={hovered || isHighlighted ? "#ffffff" : color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={hovered || isHighlighted ? 0.004 : 0}
        outlineColor="#ffffff"
        onPointerOver={() => { setHovered(true); onHover(data.word); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); onHover(null); document.body.style.cursor = "default"; }}
      >
        {data.word}
      </Text>

      {hovered && (
        <Html distanceFactor={8} style={{ pointerEvents: "none" }}>
          <div style={tooltip}>
            <strong style={{ color: "#e2e8f0" }}>{data.word}</strong>
            <span style={{ color: "#94a3b8" }}>{Math.round(data.weight * 100)}% relevance</span>
          </div>
        </Html>
      )}
    </group>
  );
}

const tooltip: React.CSSProperties = {
  background: "rgba(15,23,42,0.95)",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "6px 12px",
  fontFamily: "system-ui, sans-serif",
  fontSize: "0.8rem",
  whiteSpace: "nowrap",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  transform: "translate(-50%, -120%)",
};
