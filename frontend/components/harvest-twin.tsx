"use client";

import { Float, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const cropColors = {
  tomato: { primary: "#d95f3d", accent: "#f39a56", stem: "#638c35", scale: [1.08, .92, 1.02] as [number, number, number] },
  mango: { primary: "#e1ad3c", accent: "#8dae3f", stem: "#53752d", scale: [.9, 1.18, .9] as [number, number, number] },
  chili: { primary: "#c9432e", accent: "#e86b35", stem: "#527b30", scale: [.55, 1.52, .55] as [number, number, number] },
};

const positions: [number, number, number][] = [
  [-1.05,.52,-.52],[-.52,.53,-.58],[.02,.55,-.56],[.58,.53,-.52],[1.04,.52,-.42],
  [-.78,.56,.01],[-.23,.58,.02],[.34,.56,.03],[.86,.56,.08],[-.55,.6,.5],[.02,.63,.5],[.58,.61,.5],[-.02,1.02,-.02],
];

function Crate({ crop }: { crop: keyof typeof cropColors }) {
  const group = useRef<THREE.Group>(null);
  const palette = cropColors[crop];
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * .12;
    group.current.position.y = .08 + Math.sin(state.clock.elapsedTime * 1.2) * .035;
  });

  return (
    <group ref={group} position={[0, .08, 0]}>
      <mesh castShadow receiveShadow position={[0, -.02, 0]}><boxGeometry args={[3.15, .12, 2.12]} /><meshStandardMaterial color="#9b7447" roughness={.72} /></mesh>
      {[-1.45, 1.45].map((x) => <mesh key={`side-${x}`} castShadow position={[x, .36, 0]}><boxGeometry args={[.16, .78, 2.18]} /><meshStandardMaterial color="#6b4d30" roughness={.78} /></mesh>)}
      {[-.95, .95].flatMap((z) => [.18,.52,.84].map((y) => <mesh key={`${z}-${y}`} castShadow position={[0,y,z]}><boxGeometry args={[3.05,.13,.13]} /><meshStandardMaterial color="#9b7447" roughness={.72} /></mesh>))}
      {positions.map((position, index) => (
        <group key={index} position={position}>
          <mesh castShadow scale={palette.scale} rotation={[index * .12, index * .23, index * .08]}>
            <sphereGeometry args={[.31, 28, 20]} />
            <meshStandardMaterial color={index % 4 === 0 ? palette.accent : palette.primary} roughness={.36} />
          </mesh>
          <mesh castShadow position={[0,.3,0]} rotation={[0,0,index % 2 ? .18 : -.13]}>
            <cylinderGeometry args={[.03,.045,.17,8]} /><meshStandardMaterial color={palette.stem} roughness={.65} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function HarvestTwin({ crop = "tomato" }: { crop?: keyof typeof cropColors }) {
  return (
    <Canvas shadows dpr={[1, 1.7]} camera={{ position: [5.2, 3.4, 6.2], fov: 35 }} gl={{ alpha: true, antialias: true }}>
      <hemisphereLight intensity={2.1} color="#edf6d8" groundColor="#173d2c" />
      <directionalLight castShadow intensity={3.8} position={[4,7,4]} shadow-mapSize={[1024,1024]} />
      <pointLight intensity={11} color="#b7d75a" position={[-3,2.2,-1]} distance={12} />
      <Float speed={1.1} rotationIntensity={.08} floatIntensity={.18}><Crate crop={crop} /></Float>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0,-.04,0]}><circleGeometry args={[2.4,48]} /><shadowMaterial transparent opacity={.26} /></mesh>
      <gridHelper args={[6.4,13,"#8bad3c","#2b5a42"]} position={[0,-.02,0]} />
      <OrbitControls enablePan={false} enableZoom={false} enableDamping dampingFactor={.04} rotateSpeed={2.1} minPolarAngle={Math.PI / 3.1} maxPolarAngle={Math.PI / 2.05} />
    </Canvas>
  );
}
