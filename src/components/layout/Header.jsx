import React from 'react';
import { NAV_ITEMS } from '../../constants/config';

// 顶部导航栏组件
const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" fill="#FF6B35"/>
              <path d="M10 10L20 5L30 10V20L20 25L10 20V10Z" fill="white"/>
              <circle cx="20" cy="15" r="3" fill="#FF6B35"/>
            </svg>
          </div>
          <h1 className="site-title">智能机器人仿真开发平台资源库</h1>
        </div>
        <nav className="main-nav">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item} 
              href="#" 
              className={`nav-link ${item === '机器人' ? 'active' : ''}`}
              onClick={(e) => e.preventDefault()}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="header-right">
          <div className="language-selector">
            <span>中文</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="user-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#FF6B35" strokeWidth="2" fill="none"/>
              <path d="M6 20C6 16 9 14 12 14C15 14 18 16 18 20" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
