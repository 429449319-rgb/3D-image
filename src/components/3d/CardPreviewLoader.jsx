import React from 'react';
import { Html } from '@react-three/drei';

// 卡片预览加载指示器
const CardPreviewLoader = () => {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #f0f0f0',
          borderTop: '3px solid #FF6B35',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ 
          fontSize: '12px', 
          color: '#666',
          background: 'rgba(255,255,255,0.9)',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          加载中...
        </span>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Html>
  );
};

export default CardPreviewLoader;
