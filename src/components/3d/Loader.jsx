import React from 'react';
import { Html, useProgress } from '@react-three/drei';

// 加载进度条组件
function Loader() {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', 
        padding: '40px 50px', 
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        textAlign: 'center',
        minWidth: '280px'
      }}>
        {/* 加载动画图标 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            margin: '0 auto',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #FF6B35',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
        
        {/* 标题 */}
        <div style={{ 
          fontSize: '18px', 
          color: '#333', 
          marginBottom: '8px',
          fontWeight: '600'
        }}>
          正在加载 3D 模型
        </div>
        
        {/* 提示文字 */}
        <div style={{ 
          fontSize: '13px', 
          color: '#888', 
          marginBottom: '20px'
        }}>
          首次加载可能需要几秒钟，请耐心等待
        </div>
        
        {/* 进度条容器 */}
        <div style={{
          width: '100%',
          height: '8px',
          background: '#e9ecef',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          {/* 进度条填充 */}
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #FF6B35 0%, #FF8F5E 100%)',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        {/* 百分比显示 */}
        <div style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#FF6B35',
          letterSpacing: '1px'
        }}>
          {progress.toFixed(0)}%
        </div>
      </div>
      
      {/* CSS 动画 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Html>
  );
}

export default Loader;
