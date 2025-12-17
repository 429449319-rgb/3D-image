import React, { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// GLB/GLTF 模型组件（带相机自适应）
function GLBModel({ url, onModelLoaded }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (clonedScene && !hasLoaded.current) {
      hasLoaded.current = true;
      
      const box = new THREE.Box3().setFromObject(clonedScene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = box.getCenter(new THREE.Vector3());
      
      // 计算模型信息
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // 将模型居中到原点
      clonedScene.position.set(-center.x, -center.y, -center.z);
      
      // 回调通知父组件模型尺寸，用于调整相机
      if (onModelLoaded) {
        onModelLoaded({ size, center, maxDim });
      }
    }
  }, [clonedScene, onModelLoaded]);

  return <primitive object={clonedScene} />;
}

export default GLBModel;
