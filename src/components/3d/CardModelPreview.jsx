import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GLBModel from './GLBModel';
import CameraController from './CameraController';
import CardPreviewLoader from './CardPreviewLoader';

// 卡片悬停 3D 预览组件
const CardModelPreview = ({ modelUrl }) => {
  const [modelInfo, setModelInfo] = useState(null);
  const controlsRef = useRef();

  return (
    <Canvas
      style={{ background: 'transparent' }}
      camera={{ position: [0, 1, 5], fov: 50 }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <Suspense fallback={<CardPreviewLoader />}>
        {modelUrl && <GLBModel url={modelUrl} onModelLoaded={setModelInfo} />}
      </Suspense>
      <CameraController modelInfo={modelInfo} controlsRef={controlsRef} />
      <OrbitControls 
        ref={controlsRef}
        enableZoom={false} 
        enablePan={false}
        autoRotate 
        autoRotateSpeed={4} 
      />
    </Canvas>
  );
};

export default CardModelPreview;
