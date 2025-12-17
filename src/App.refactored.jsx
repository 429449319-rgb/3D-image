import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ModelGrid from './components/model/ModelGrid';
import ModelModal from './components/model/ModelModal';
import Pagination from './components/ui/Pagination';
import { fetchModelsFromAPI } from './services/modelService';
import { DEFAULT_PAGE_SIZE } from './constants/config';

function App() {
  // 状态管理
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [currentCategory, setCurrentCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [pageInputValue, setPageInputValue] = useState(1);

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [activeView, setActiveView] = useState(0);
  
  // 加载数据（从真实后端API获取）
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchModelsFromAPI(currentPage, pageSize, currentCategory, searchKeyword);
      
      setModels(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setPageInputValue(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, pageSize, currentCategory, searchKeyword]);

  // 搜索处理
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      doSearch();
    }
  };

  const doSearch = () => {
    setSearchKeyword(searchInputValue.trim());
    setCurrentPage(1);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInputValue(value);
    if (value === '' && searchKeyword !== '') {
      setSearchKeyword('');
      setCurrentPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setSearchInputValue('');
    setCurrentPage(1);
  };

  // 分类处理
  const handleCategoryClick = (category) => {
    setCurrentCategory(category === currentCategory ? '' : category);
    setSearchKeyword('');
    setSearchInputValue('');
    setCurrentPage(1);
  };

  // 分页处理
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageInputChange = (e) => {
    setPageInputValue(e.target.value);
  };

  const handlePageInputBlur = () => {
    const p = parseInt(pageInputValue);
    if (p >= 1 && p <= totalPages) {
      handlePageChange(p);
    } else {
      setPageInputValue(currentPage);
    }
  };

  const handlePageInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      const p = parseInt(pageInputValue);
      if (p >= 1 && p <= totalPages) {
        handlePageChange(p);
      }
    }
  };

  // 模型操作
  const handleDownload = (e, model) => {
    e.stopPropagation();
    alert(`开始下载模型: ${model.name}`);
  };

  const openModal = (model) => {
    setCurrentModel({ ...model }); 
    setActiveView(0);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentModel(null);
    document.body.style.overflow = '';
  };

  const handleLike = () => {
    if (currentModel) {
      const newStatus = !currentModel.isLiked;
      const newCount = newStatus ? currentModel.likeCount + 1 : currentModel.likeCount - 1;
      
      setCurrentModel({
        ...currentModel,
        isLiked: newStatus,
        likeCount: newCount
      });

      setModels(models.map(m => m.id === currentModel.id ? { ...m, isLiked: newStatus, likeCount: newCount } : m));
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('链接已复制到剪贴板'))
      .catch(() => alert('分享功能暂不可用'));
  };

  return (
    <div className="app-container">
      {/* 顶部导航栏 */}
      <Header />

      {/* 主内容区域 */}
      <div className="main-container">
        {/* 左侧边栏 */}
        <Sidebar
          currentCategory={currentCategory}
          searchKeyword={searchKeyword}
          searchInputValue={searchInputValue}
          onCategoryClick={handleCategoryClick}
          onSearchInputChange={handleSearchInputChange}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
        />

        {/* 主内容区 */}
        <main className="content-area">
          <ModelGrid
            models={models}
            loading={loading}
            onOpenModal={openModal}
            onDownload={handleDownload}
          />

          {/* 分页控件 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            pageInputValue={pageInputValue}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onPageInputChange={handlePageInputChange}
            onPageInputBlur={handlePageInputBlur}
            onPageInputKeyPress={handlePageInputKeyPress}
          />
        </main>
      </div>

      {/* 模型详情弹窗 */}
      <ModelModal
        isOpen={modalOpen}
        model={currentModel}
        activeView={activeView}
        onClose={closeModal}
        onViewChange={setActiveView}
        onDownload={handleDownload}
        onLike={handleLike}
        onShare={handleShare}
      />
    </div>
  );
}

export default App;
