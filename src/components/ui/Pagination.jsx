import React from 'react';
import { PAGE_SIZE_OPTIONS } from '../../constants/config';

// 分页控件组件
const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  pageSize, 
  pageInputValue,
  onPageChange, 
  onPageSizeChange,
  onPageInputChange,
  onPageInputBlur,
  onPageInputKeyPress
}) => {
  return (
    <div className="pagination">
      <div className="pagination-info">
        <span>共{totalItems}条</span>
      </div>
      <div className="pagination-controls">
        <select 
          className="page-size-select" 
          value={pageSize} 
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map(size => (
            <option key={size} value={size}>{size}条/页</option>
          ))}
        </select>
        
        <div className="page-numbers">
          <button className="page-btn" onClick={() => onPageChange(currentPage - 1)}>‹</button>
          
          {/* 简单分页逻辑，仅展示部分 */}
          {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
             let p = i + 1;
             // 简单的逻辑：如果总页数很大，这里只显示前5页作为演示
             // 实际项目中需要更复杂的逻辑来处理 ... 省略号
             if (currentPage > 3 && totalPages > 5) {
               p = currentPage - 2 + i;
               if (p > totalPages) return null;
             }
             return (
               <button 
                 key={p} 
                 className={`page-btn ${p === currentPage ? 'active' : ''}`}
                 onClick={() => onPageChange(p)}
               >
                 {p}
               </button>
             );
          })}
          
          <button className="page-btn" onClick={() => onPageChange(currentPage + 1)}>›</button>
        </div>
        
        <div className="page-jump">
          <span>前往</span>
          <input 
            type="number" 
            className="page-input" 
            value={pageInputValue}
            min="1" 
            max={totalPages}
            onChange={onPageInputChange}
            onBlur={onPageInputBlur}
            onKeyPress={onPageInputKeyPress}
          />
          <span>页</span>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
