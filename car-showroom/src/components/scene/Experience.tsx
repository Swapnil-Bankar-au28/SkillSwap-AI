import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { CarModel } from './CarModel';
import { CameraRig } from './CameraRig';
import type { MercedesCarModel } from '../../data/content';

interface ExperienceProps {
  paintColor: string;
  scrollProgressRef: React.MutableRefObject<number>;
  selectedCar: MercedesCarModel;
}

export const Experience: React.FC<ExperienceProps> = ({
  paintColor,
  scrollProgressRef,
  selectedCar,
}) => {
  const carGroupRef = useRef<THREE.Group>(null);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [3.2, 1.5, 4.4], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#07080b']} />
        <fog attach="fog" args={['#07080b', 7, 22]} />

        {/* High-Impact Studio Lighting */}
        <ambientLight intensity={1.1} />

        {/* Main Sun/Studio Key Light */}
        <directionalLight
          position={[8, 14, 8]}
          intensity={2.8}
          color="#ffffff"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* Petronas Cyan Fill Light */}
        <directionalLight position={[-10, 10, -5]} intensity={1.8} color="#00d2be" />

        {/* Chrome Sculpting Rim Light */}
        <spotLight
          position={[0, 14, -8]}
          intensity={3.5}
          color="#ffffff"
          angle={0.65}
          penumbra={0.8}
        />

        {/* Front Grille Highlight Light */}
        <pointLight position={[0, 1.2, 4.5]} intensity={1.8} color="#f8fafc" distance={6} />

        <Environment preset="city" />

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.85}
          scale={15}
          blur={1.6}
          far={5}
          color="#000000"
        />

        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#07080b" roughness={0.7} metalness={0.3} />
        </mesh>

        <CarModel ref={carGroupRef} paintColor={paintColor} selectedCar={selectedCar} />
        <CameraRig scrollProgressRef={scrollProgressRef} carGroupRef={carGroupRef} />
      </Canvas>
    </div>
  );
};
