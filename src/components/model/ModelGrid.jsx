import React from 'react';
import ModelCard from './ModelCard';

// 模型网格组件
const ModelGrid = ({ models, loading, onOpenModal, onDownload }) => {
  if (loading) {
    return (
      <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
        加载中...
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
        暂无数据
      </div>
    );
  }

  return (
    <div className="model-grid">
      {models.map(model => (
        <ModelCard 
          key={model.id} 
          model={model} 
          onOpenModal={onOpenModal} 
          onDownload={onDownload} 
        />
      ))}
    </div>
  );
};

export default ModelGrid;
