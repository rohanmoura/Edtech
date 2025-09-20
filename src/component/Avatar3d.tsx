"use client"

import type React from "react"
import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere, Box, Torus } from "@react-three/drei"
import type * as THREE from "three"

const BrainstormingAvatar = () => {
  const groupRef = useRef<THREE.Group>(null)
  const brainRef = useRef<THREE.Mesh>(null)
  const ideaBulb1Ref = useRef<THREE.Group>(null)
  const ideaBulb2Ref = useRef<THREE.Group>(null)
  const ideaBulb3Ref = useRef<THREE.Group>(null)
  const neuralRing1Ref = useRef<THREE.Mesh>(null)
  const neuralRing2Ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.2
    }

    if (brainRef.current) {
      brainRef.current.position.y = Math.sin(time * 1.5) * 0.1
      brainRef.current.rotation.y += 0.005
    }

    // Animate idea bulbs floating around
    if (ideaBulb1Ref.current) {
      const radius = 3
      ideaBulb1Ref.current.position.x = Math.cos(time * 0.8) * radius
      ideaBulb1Ref.current.position.z = Math.sin(time * 0.8) * radius
      ideaBulb1Ref.current.position.y = Math.sin(time * 2) * 0.5 + 1
    }

    if (ideaBulb2Ref.current) {
      const radius = 2.5
      ideaBulb2Ref.current.position.x = Math.cos(time * 0.6 + Math.PI) * radius
      ideaBulb2Ref.current.position.z = Math.sin(time * 0.6 + Math.PI) * radius
      ideaBulb2Ref.current.position.y = Math.sin(time * 1.8 + Math.PI) * 0.4 - 0.5
    }

    if (ideaBulb3Ref.current) {
      const radius = 3.2
      ideaBulb3Ref.current.position.x = Math.cos(time * 0.5 + Math.PI * 0.5) * radius
      ideaBulb3Ref.current.position.z = Math.sin(time * 0.5 + Math.PI * 0.5) * radius
      ideaBulb3Ref.current.position.y = Math.sin(time * 1.6 + Math.PI * 0.5) * 0.6 + 0.8
    }

    // Animate neural network rings
    if (neuralRing1Ref.current) {
      neuralRing1Ref.current.rotation.x = time * 0.4
      neuralRing1Ref.current.rotation.z = time * 0.3
    }

    if (neuralRing2Ref.current) {
      neuralRing2Ref.current.rotation.x = -time * 0.3
      neuralRing2Ref.current.rotation.z = -time * 0.4
    }
  })

  // Idea bulb component
  const IdeaBulb = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
      {/* Bulb base */}
      <Sphere args={[0.15, 12, 12]} position={[0, 0, 0]}>
        <meshPhongMaterial
          color="hsl(45, 100%, 70%)"
          emissive="hsl(45, 100%, 30%)"
          emissiveIntensity={0.4}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Bulb glow effect */}
      <Sphere args={[0.25, 12, 12]} position={[0, 0, 0]}>
        <meshPhongMaterial
          color="hsl(45, 100%, 80%)"
          transparent
          opacity={0.2}
          emissive="hsl(45, 100%, 50%)"
          emissiveIntensity={0.3}
        />
      </Sphere>

      {/* Bulb stem */}
      <Box args={[0.03, 0.1, 0.03]} position={[0, -0.18, 0]}>
        <meshPhongMaterial color="hsl(30, 50%, 40%)" />
      </Box>
    </group>
  )

  return (
    <group ref={groupRef}>
      {/* Central Brain Structure */}
      <Sphere ref={brainRef} args={[1, 20, 20]} position={[0, 0, 0]}>
        <meshPhongMaterial
          color="hsl(221, 83%, 53%)"
          transparent
          opacity={0.8}
          emissive="hsl(221, 83%, 25%)"
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* Brain texture overlay */}
      <Sphere args={[1.02, 16, 16]} position={[0, 0, 0]}>
        <meshPhongMaterial color="hsl(221, 83%, 60%)" transparent opacity={0.3} wireframe />
      </Sphere>

      {/* Neural Network Rings */}
      <Torus ref={neuralRing1Ref} args={[2.2, 0.02, 8, 32]} position={[0, 0, 0]}>
        <meshPhongMaterial color="hsl(200, 100%, 70%)" emissive="hsl(200, 100%, 40%)" emissiveIntensity={0.5} />
      </Torus>

      <Torus ref={neuralRing2Ref} args={[1.8, 0.02, 8, 32]} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhongMaterial color="hsl(280, 100%, 70%)" emissive="hsl(280, 100%, 40%)" emissiveIntensity={0.5} />
      </Torus>

      {/* Floating Idea Bulbs */}
      <group ref={ideaBulb1Ref}>
        <IdeaBulb position={[0, 0, 0]} />
      </group>

      <group ref={ideaBulb2Ref}>
        <IdeaBulb position={[0, 0, 0]} />
      </group>

      <group ref={ideaBulb3Ref}>
        <IdeaBulb position={[0, 0, 0]} />
      </group>

      {/* Neural Connection Points */}
      <Sphere args={[0.08, 8, 8]} position={[0.7, 0.5, 0.7]}>
        <meshPhongMaterial color="hsl(120, 100%, 60%)" emissive="hsl(120, 100%, 30%)" emissiveIntensity={0.6} />
      </Sphere>

      <Sphere args={[0.08, 8, 8]} position={[-0.6, -0.4, 0.8]}>
        <meshPhongMaterial color="hsl(60, 100%, 60%)" emissive="hsl(60, 100%, 30%)" emissiveIntensity={0.6} />
      </Sphere>

      <Sphere args={[0.08, 8, 8]} position={[0.5, -0.7, -0.5]}>
        <meshPhongMaterial color="hsl(300, 100%, 60%)" emissive="hsl(300, 100%, 30%)" emissiveIntensity={0.6} />
      </Sphere>

      {/* Thought Particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Sphere
          key={i}
          args={[0.04, 6, 6]}
          position={[
            Math.cos((i / 8) * Math.PI * 2) * 1.5,
            Math.sin((i / 8) * Math.PI * 4) * 0.3,
            Math.sin((i / 8) * Math.PI * 2) * 1.5,
          ]}
        >
          <meshPhongMaterial
            color="hsl(180, 100%, 70%)"
            emissive="hsl(180, 100%, 40%)"
            emissiveIntensity={0.4}
            transparent
            opacity={0.7}
          />
        </Sphere>
      ))}
    </group>
  )
}

export const Avatar3D: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="hsl(210, 100%, 70%)" />
        <BrainstormingAvatar />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
