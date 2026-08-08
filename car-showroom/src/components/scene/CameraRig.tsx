import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface CameraRigProps {
  scrollProgressRef: React.MutableRefObject<number>;
  carGroupRef: React.RefObject<THREE.Group | null>;
}

interface CameraShot {
  progress: number;
  pos: THREE.Vector3;
  lookAt: THREE.Vector3;
}

// 6 Camera Shot Keyframes optimized for prominent 3D car stage visibility
const CAMERA_SHOTS: CameraShot[] = [
  // 0.00: Hero - Elevated 3/4 Front View centered on screen right behind Hero text
  {
    progress: 0.0,
    pos: new THREE.Vector3(3.2, 1.5, 4.4),
    lookAt: new THREE.Vector3(0, 0.4, 0),
  },
  // 0.20: Fleet & Design - Low side orbit profile sweeping across aerodynamic body
  {
    progress: 0.2,
    pos: new THREE.Vector3(-4.2, 0.9, 2.0),
    lookAt: new THREE.Vector3(0, 0.45, 0.1),
  },
  // 0.40: Performance - Close push-in on front AMG wheel, caliper & Panamericana grille
  {
    progress: 0.4,
    pos: new THREE.Vector3(1.7, 0.65, 2.0),
    lookAt: new THREE.Vector3(0.8, 0.35, 1.2),
  },
  // 0.58: Interior - Elevated pitch down looking into cockpit & cabin glass
  {
    progress: 0.58,
    pos: new THREE.Vector3(0.0, 2.4, 1.3),
    lookAt: new THREE.Vector3(0, 0.5, -0.2),
  },
  // 0.75: Configurator - High 3/4 studio angle for color shader inspection
  {
    progress: 0.75,
    pos: new THREE.Vector3(3.6, 1.8, 3.8),
    lookAt: new THREE.Vector3(0, 0.45, 0),
  },
  // 1.00: Test Drive - Departure crane shot looking down at Mercedes AMG
  {
    progress: 1.0,
    pos: new THREE.Vector3(-3.2, 2.4, -4.2),
    lookAt: new THREE.Vector3(0, 0.4, 0),
  },
];

function getInterpolatedShot(progress: number) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  let idx = 0;
  for (let i = 0; i < CAMERA_SHOTS.length - 1; i++) {
    if (clampedProgress >= CAMERA_SHOTS[i].progress) {
      idx = i;
    }
  }

  const currentShot = CAMERA_SHOTS[idx];
  const nextShot = CAMERA_SHOTS[Math.min(idx + 1, CAMERA_SHOTS.length - 1)];

  if (idx === CAMERA_SHOTS.length - 1 || currentShot.progress === nextShot.progress) {
    return { pos: currentShot.pos, lookAt: currentShot.lookAt };
  }

  const factor = (clampedProgress - currentShot.progress) / (nextShot.progress - currentShot.progress);

  const lerpedPos = new THREE.Vector3().lerpVectors(currentShot.pos, nextShot.pos, factor);
  const lerpedLookAt = new THREE.Vector3().lerpVectors(currentShot.lookAt, nextShot.lookAt, factor);

  return { pos: lerpedPos, lookAt: lerpedLookAt };
}

export const CameraRig: React.FC<CameraRigProps> = ({ scrollProgressRef, carGroupRef }) => {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(0, 0.4, 0));
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useFrame((_, delta) => {
    const p = scrollProgressRef.current;

    if (prefersReducedMotion.current) {
      if (carGroupRef.current) {
        carGroupRef.current.rotation.y += delta * 0.25;
      }
      camera.position.set(3.5, 1.8, 4.5);
      camera.lookAt(0, 0.4, 0);
      return;
    }

    const { pos: targetPos, lookAt: targetLookAt } = getInterpolatedShot(p);

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.x, 4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.y, 4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.z, 4, delta);

    currentLookAt.current.x = THREE.MathUtils.damp(currentLookAt.current.x, targetLookAt.x, 4, delta);
    currentLookAt.current.y = THREE.MathUtils.damp(currentLookAt.current.y, targetLookAt.y, 4, delta);
    currentLookAt.current.z = THREE.MathUtils.damp(currentLookAt.current.z, targetLookAt.z, 4, delta);

    camera.lookAt(currentLookAt.current);

    if (carGroupRef.current) {
      const targetRotationY = p * Math.PI * 4;
      carGroupRef.current.rotation.y = THREE.MathUtils.damp(
        carGroupRef.current.rotation.y,
        targetRotationY,
        3,
        delta
      );
    }
  });

  return null;
};
