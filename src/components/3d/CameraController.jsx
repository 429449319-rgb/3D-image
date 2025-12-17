import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

// 相机自适应控制器
function CameraController({ modelInfo, controlsRef, viewPreset }) {
  const { camera } = useThree();
  const hasAdjusted = useRef(false);
  
  useEffect(() => {
    // 只在模型首次加载时调整相机，避免干扰用户操作
    if (modelInfo && controlsRef.current && !hasAdjusted.current) {
      const { maxDim } = modelInfo;
      
      // 根据模型大小计算最佳相机距离
      const fov = camera.fov * (Math.PI / 180);
      const distance = (maxDim / 2) / Math.tan(fov / 2) * 1.8; // 1.8 倍余量
      const cameraDistance = Math.max(distance, 3); // 最小距离为 3
      
      // 如果有视角预设，使用预设方向但调整距离
      if (viewPreset) {
        const [px, py, pz] = viewPreset;
        const presetLength = Math.sqrt(px * px + py * py + pz * pz);
        // 保持预设方向，但使用自适应距离
        const scale = cameraDistance / presetLength;
        camera.position.set(px * scale, py * scale, pz * scale);
      } else {
        camera.position.set(cameraDistance * 0.7, cameraDistance * 0.4, cameraDistance * 0.9);
      }
      
      camera.updateProjectionMatrix();
      
      // 更新 OrbitControls 的目标点
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      
      hasAdjusted.current = true;
      console.log('📷 相机已自适应，距离:', cameraDistance.toFixed(2));
    }
  }, [modelInfo, camera, controlsRef, viewPreset]);
  
  // 当 modelInfo 变为 null 时（切换视角），重置标记
  useEffect(() => {
    if (!modelInfo) {
      hasAdjusted.current = false;
    }
  }, [modelInfo]);
  
  return null;
}

export default CameraController;
