import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { MercedesCarModel } from '../../data/content';

interface CarModelProps {
  paintColor: string;
  selectedCar: MercedesCarModel;
}

// 3D Mercedes Star Emblem Component
function MercedesStarBadge({ position, scale = 1, rotation = [0, 0, 0] }: { position: [number, number, number]; scale?: number; rotation?: [number, number, number] }) {
  return (
    <group position={position} scale={[scale, scale, scale]} rotation={rotation}>
      {/* Outer Chrome Ring */}
      <mesh>
        <torusGeometry args={[0.2, 0.035, 16, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.98} />
      </mesh>
      {/* 3 Prongs of Mercedes Star */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
        <mesh key={i} rotation={[0, 0, angle]}>
          <coneGeometry args={[0.05, 0.18, 3]} />
          <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.98} />
        </mesh>
      ))}
    </group>
  );
}

// Real GLTF Car Loader Component
function RealGLTFCarMesh({ paintColor }: { paintColor: string }) {
  const { scene } = useGLTF('/models/car.glb');

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;

        if (mat) {
          const nodeName = (mesh.name || '').toLowerCase();
          const matName = (mat.name || '').toLowerCase();

          // Target car body panels for dynamic paint repainting
          if (
            nodeName.includes('body') ||
            nodeName.includes('car_body') ||
            nodeName.includes('paint') ||
            matName.includes('body') ||
            matName.includes('paint') ||
            matName.includes('car_body') ||
            nodeName === 'mesh_0' ||
            nodeName === 'object_1'
          ) {
            mat.color = new THREE.Color(paintColor);
            mat.roughness = 0.12;
            mat.metalness = 0.88;
            mat.needsUpdate = true;
          }
        }
      }
    });
  }, [scene, paintColor]);

  return (
    <primitive
      object={scene}
      scale={[1.4, 1.4, 1.4]}
      position={[0, -0.2, 0]}
      rotation={[0, Math.PI, 0]}
    />
  );
}

useGLTF.preload('/models/car.glb');

export const CarModel = React.forwardRef<THREE.Group, CarModelProps>(({ paintColor }, ref) => {
  const wheelsGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wheelsGroupRef.current) {
      wheelsGroupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {/* REAL 3D GLTF CAR MODEL STAGE */}
      <React.Suspense fallback={null}>
        <RealGLTFCarMesh paintColor={paintColor} />
      </React.Suspense>

      {/* Centered Mercedes 3-Pointed Star Badge over 3D Car Hood */}
      <MercedesStarBadge position={[0, 0.48, 2.1]} scale={1.1} rotation={[-0.2, 0, 0]} />

      {/* AMG Underglow Lighting (Mercedes Petronas Cyan) */}
      <pointLight position={[0, 0.05, 0]} color="#00d2be" intensity={3.5} distance={4.5} />
    </group>
  );
});

CarModel.displayName = 'CarModel';
