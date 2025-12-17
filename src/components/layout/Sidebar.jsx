import React from 'react';
import { CATEGORIES, CATEGORY_MAP } from '../../constants/categories';

// 左侧边栏组件
const Sidebar = ({ 
  currentCategory, 
  searchKeyword, 
  searchInputValue, 
  onCategoryClick, 
  onSearchInputChange, 
  onSearch, 
  onClearSearch 
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">目录</div>
      <div className="search-box">
        <input 
          type="text" 
          placeholder="请输入物品名称搜索" 
          className="search-input"
          value={searchInputValue}
          onKeyPress={onSearch}
          onChange={onSearchInputChange}
        />
        <button 
          className="search-btn"
          onClick={onSearch}
          title="搜索"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M14 14L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      {searchKeyword && (
        <div className="search-result-hint">
          搜索: "{searchKeyword}" 
          <span 
            className="clear-search" 
            onClick={onClearSearch}
          >
            清除
          </span>
        </div>
      )}
      <ul className="category-list">
        {CATEGORIES.map((cat, index) => (
          <li className="category-item" key={index}>
            <a 
              href="#" 
              className={`category-link ${currentCategory === cat ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); onCategoryClick(cat); }}
            >
              {CATEGORY_MAP[cat] || cat}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
