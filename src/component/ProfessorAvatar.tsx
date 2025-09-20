  "use client";

  import React, { Suspense, useRef } from "react";
  import { Canvas, useFrame } from "@react-three/fiber";
  import { OrbitControls, useGLTF } from "@react-three/drei";
  import type * as THREE from "three";

  function AvatarModel({ scale, position }: { scale: number; position: [number, number, number] }) {
    const { scene } = useGLTF("https://models.readyplayer.me/68cea957665bc541b13a0198.glb");
    return <primitive object={scene} scale={scale} position={position} />;
  }

  // 👉 This goes inside Canvas
  function AnimatedAvatar({ isSpeaking }: { isSpeaking: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const lightRef = useRef<THREE.DirectionalLight>(null);

    useFrame((state) => {
      const t = state.clock.getElapsedTime();

      if (groupRef.current) {
        // Subtle idle motion
        const idleY = Math.sin(t * 0.6) * 0.02;
        groupRef.current.position.y = -0.02 + idleY;

        if (isSpeaking) {
          // Head-like motion while speaking
          groupRef.current.rotation.y = Math.sin(t * 3) * 0.05;
          groupRef.current.rotation.x = Math.sin(t * 2) * 0.03;
          groupRef.current.scale.setScalar(1 + Math.sin(t * 6) * 0.01);
        } else {
          groupRef.current.rotation.x *= 0.9;
          groupRef.current.rotation.y *= 0.9;
          groupRef.current.scale.set(1, 1, 1);
        }
      }

      if (lightRef.current) {
        lightRef.current.intensity = isSpeaking ? 1 + Math.sin(t * 8) * 0.1 : 1;
      }
    });

    return (
      <>
        <ambientLight intensity={0.9} />
        <directionalLight ref={lightRef} position={[5, 5, 5]} intensity={1} />
        <group ref={groupRef}>
          <AvatarModel scale={1.4} position={[0, -1.9, 0]} />
        </group>
      </>
    );
  }

  export default function ProfessorAvatar({ isSpeaking = false }: { isSpeaking?: boolean }) {
    return (
      <div
        style={{
          width: "180px",
          height: "180px",
          margin: "auto",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Canvas camera={{ position: [0, 1.2, 2.2], fov: 25 }}>
          <Suspense fallback={null}>
            <AnimatedAvatar isSpeaking={isSpeaking} />
          </Suspense>
          <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
        </Canvas>
      </div>
    );
  }
