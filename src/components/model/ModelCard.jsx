import React, { useState, useRef } from 'react';
import { CardModelPreview } from '../3d';

// 模型卡片组件（带悬停预览）
const ModelCard = ({ model, onOpenModal, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewOpacity, setPreviewOpacity] = useState(0);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    // 立即开始加载 3D 模型（但不显示）
    setShowPreview(true);
    // 延迟后淡入显示
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      // 使用 requestAnimationFrame 确保 DOM 更新后再触发动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPreviewOpacity(1);
        });
      });
    }, 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // 先淡出
    setPreviewOpacity(0);
    setIsHovered(false);
    // 延迟后卸载 3D 组件
    setTimeout(() => {
      setShowPreview(false);
    }, 300);
  };

  return (
    <div 
      className="model-card" 
      onClick={() => onOpenModal(model)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="model-image">
        {/* 原始图片始终存在 */}
        {model.imageUrl ? (
          <img 
            src={model.imageUrl} 
            alt={model.name} 
            className="model-image-img" 
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
            onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} 
          />
        ) : null}
        <div className="placeholder-image" style={{display: model.imageUrl ? 'none' : 'flex'}}></div>
        
        {/* 3D 预览层（覆盖在图片上方，带淡入淡出效果） */}
        {showPreview && model.previewModelUrl && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10,
            background: '#ffffff',
            borderRadius: '8px 8px 0 0',
            opacity: previewOpacity,
            transition: 'opacity 0.4s ease-in-out',
            pointerEvents: isHovered ? 'auto' : 'none'
          }}>
            <CardModelPreview modelUrl={model.previewModelUrl} />
            {/* 3D 标识 */}
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(255, 107, 53, 0.9)',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              opacity: previewOpacity,
              transition: 'opacity 0.3s ease-in-out 0.1s'
            }}>
              3D
            </div>
          </div>
        )}
      </div>
      <div className="model-info">
        <div className="model-name" dangerouslySetInnerHTML={{ __html: model.name }} />
        <div className="model-size">{model.size}</div>
        <button className="download-btn" onClick={(e) => onDownload(e, model)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 14V2M10 14L6 10M10 14L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 16V18C2 18.5523 2.44772 19 3 19H17C17.5523 19 18 18.5523 18 18V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ModelCard;
