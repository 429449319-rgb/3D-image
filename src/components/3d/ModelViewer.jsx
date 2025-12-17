import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GLBModel from './GLBModel';
import ViewAngleController from './ViewAngleController';
import ErrorBoundary from './ErrorBoundary';
import Loader from './Loader';

// 3D 模型查看器组件
const ModelViewer = ({ modelUrl, activeView = 0 }) => {
  const containerRef = useRef(null);
  const controlsRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

  // 切换全屏
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('全屏失败:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // 监听全屏变化事件
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative', 
        background: isFullscreen ? '#1a1a1a' : '#f5f5f5',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
        <Canvas 
          style={{ background: 'radial-gradient(circle at center, #ffffff 0%, #e0e0e0 50%, #333333 100%)' }}
          camera={{ position: [0, 0, 10], fov: 50 }}
          onCreated={() => console.log('✅ Canvas 已创建，开始加载模型...')}
          onError={(error) => console.error('❌ Canvas 错误:', error)}
        >
          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} intensity={0.6} />
              <directionalLight position={[-5, -5, -5]} intensity={0.3} />
              
              {modelUrl ? (
                <GLBModel url={modelUrl} onModelLoaded={setModelInfo} />
              ) : (
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="#cccccc" />
                </mesh>
              )}
            </Suspense>
          </ErrorBoundary>
          
          <ViewAngleController viewIndex={activeView} modelInfo={modelInfo} controlsRef={controlsRef} />
          <OrbitControls ref={controlsRef} makeDefault autoRotate autoRotateSpeed={0.5} />
        </Canvas>

        {/* 全屏按钮 */}
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 100
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 107, 53, 0.9)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.6)'}
          title={isFullscreen ? '退出全屏' : '全屏查看'}
        >
          {isFullscreen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          )}
        </button>

        {/* 全屏模式下的提示 */}
        {isFullscreen && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            zIndex: 100
          }}>
            按 ESC 或点击右下角按钮退出全屏
          </div>
        )}
    </div>
  );
};

export default ModelViewer;
