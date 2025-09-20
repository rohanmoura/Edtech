"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function AvatarModel({ scale, position }: { scale: number; position: [number, number, number] }) {
  const { scene } = useGLTF(
    "https://models.readyplayer.me/68cea957665bc541b13a0198.glb"
  );
  return <primitive object={scene} scale={scale} position={position} />;
}

export default function ProfessorAvatar() {
  // Refined position for perfect centering
  const scale = 1.5;
  const position: [number, number, number] = [0, -1.4, 0];

  return (
    <div
      style={{
        width: "400px",
        height: "400px",
        margin: "auto",
        border: "1px solid #ddd",
      }}
    >
      <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <AvatarModel scale={scale} position={position} />
        </Suspense>
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}
