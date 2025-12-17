import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { VIEW_PRESETS } from '../../constants/viewPresets';

// 视角控制器组件
function ViewAngleController({ viewIndex, modelInfo, controlsRef }) {
  const { camera } = useThree();
  const lastViewIndex = useRef(viewIndex);
  const hasInitialized = useRef(false);

  // 计算目标位置
  const getTargetPosition = (index, dist) => {
    switch (index) {
      case 0: return [0, 0, dist];           // 正面
      case 1: return [0, 0, -dist];          // 背面
      case 2: return [dist, 0, 0];           // 左侧
      case 3: return [-dist, 0, 0];          // 右侧
      case 4: return [0, dist, 0.001];       // 顶部
      case 5: return [0, -dist, 0.001];      // 底部
      default: return [0, 0, dist];
    }
  };

  useEffect(() => {
    if (!modelInfo || !controlsRef.current) return;
    
    const isViewChanged = lastViewIndex.current !== viewIndex;
    if (hasInitialized.current && !isViewChanged) return;
    
    const { maxDim } = modelInfo;
    // 计算合适的相机距离：让模型占据视口约70%
    const fov = camera.fov * (Math.PI / 180);
    const optimalDist = (maxDim / 2) / Math.tan(fov / 2) * 1.2;
    const targetDist = Math.max(optimalDist, 2);
    const targetPos = getTargetPosition(viewIndex, targetDist);
    
    // 直接设置相机位置
    camera.position.set(targetPos[0], targetPos[1], targetPos[2]);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    
    lastViewIndex.current = viewIndex;
    hasInitialized.current = true;
    console.log(`📷 视角: ${VIEW_PRESETS[viewIndex].name}, 距离: ${targetDist.toFixed(2)}`);
  }, [viewIndex, modelInfo, camera, controlsRef]);

  return null;
}

export default ViewAngleController;
