import React from 'react';
import { ModelViewer } from '../3d';
import { VIEW_PRESETS } from '../../constants/viewPresets';

// 模型详情弹窗组件
const ModelModal = ({ 
  isOpen, 
  model, 
  activeView, 
  onClose, 
  onViewChange, 
  onDownload, 
  onLike, 
  onShare 
}) => {
  if (!model) return null;

  return (
    <div 
      className={`modal-overlay ${isOpen ? 'active' : ''}`} 
      onClick={(e) => e.target.classList && e.target.classList.contains('modal-overlay') && onClose()}
    >
      <div className="modal-container">
        <button className="modal-close-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="modal-content">
          {/* 左侧：图片展示区 */}
          <div className="modal-gallery">
            <div className="main-image-container" style={{ height: '400px', width: '100%', position: 'relative' }}>
               <ModelViewer modelUrl={model.previewModelUrl} activeView={activeView} />
            </div>
            {/* 视角预览按钮 */}
            <div className="thumbnail-list" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              {VIEW_PRESETS.map((view, index) => (
                <button
                  key={index}
                  onClick={() => onViewChange(index)}
                  style={{
                    width: '70px',
                    height: '56px',
                    borderRadius: '8px',
                    border: activeView === index ? '2px solid #FF6B35' : '1px solid #e0e0e0',
                    background: activeView === index 
                      ? 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DC 100%)' 
                      : '#fff',
                    color: activeView === index ? '#FF6B35' : '#666',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: activeView === index 
                      ? '0 2px 8px rgba(255, 107, 53, 0.25)' 
                      : '0 1px 3px rgba(0,0,0,0.08)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeView !== index) {
                      e.currentTarget.style.borderColor = '#FF6B35';
                      e.currentTarget.style.color = '#FF6B35';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeView !== index) {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.color = '#666';
                    }
                  }}
                  title={view.name}
                >
                  <span style={{ fontSize: '18px', marginBottom: '2px' }}>{view.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: '500' }}>{view.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：信息区 */}
          <div className="modal-info-section">
            <h2 className="modal-title" dangerouslySetInnerHTML={{ __html: model.name }} />
            
            <div className="modal-description-container">
              <p className="modal-description" style={{whiteSpace: 'pre-line'}}>
                {model.description}
              </p>
            </div>

            <div className="modal-actions">
              <button className="modal-download-btn" onClick={(e) => onDownload(e, model)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
                  <path d="M12 15V3M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L2.621 19.485C2.84902 20.3978 3.67376 21 4.61473 21H19.3853C20.3262 21 21.151 20.3978 21.379 19.485L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                下载
              </button>

              <div className="secondary-actions">
                <button className={`action-btn like-btn ${model.isLiked ? 'active' : ''}`} onClick={onLike}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="icon-normal" style={{display: model.isLiked ? 'none' : 'block'}}>
                    <path d="M10 17.25L8.7625 16.1225C4.3625 12.135 1.45 9.5 1.45 6.275C1.45 3.6375 3.525 1.575 6.1625 1.575C7.65 1.575 9.075 2.2625 10 3.3375C10.925 2.2625 12.35 1.575 13.8375 1.575C16.475 1.575 18.55 3.6375 18.55 6.275C18.55 9.5 15.6375 12.135 11.2375 16.135L10 17.25Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="#FF6B35" className="icon-active" style={{display: model.isLiked ? 'block' : 'none'}}>
                    <path d="M10 17.25L8.7625 16.1225C4.3625 12.135 1.45 9.5 1.45 6.275C1.45 3.6375 3.525 1.575 6.1625 1.575C7.65 1.575 9.075 2.2625 10 3.3375C10.925 2.2625 12.35 1.575 13.8375 1.575C16.475 1.575 18.55 3.6375 18.55 6.275C18.55 9.5 15.6375 12.135 11.2375 16.135L10 17.25Z" fill="#FF6B35"/>
                  </svg>
                  <span>{model.likeCount}</span>
                </button>
                <button className="action-btn share-btn" onClick={onShare}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>分享</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelModal;
