import { API_BASE_URL } from '../constants/config';
import { CATEGORY_MAP } from '../constants/categories';
import { formatFileSize, replaceLocalhost } from '../utils/formatters';

// 从后端获取数据
export const fetchModelsFromAPI = async (page = 1, pageSize = 10, category = '', keyword = '') => {
  try {
    let url = `${API_BASE_URL}/search/list?pageNum=${page}&pageSize=${pageSize}`;
    
    // 如果有分类筛选
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    // 如果有关键词搜索
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    
    console.log('🔍 请求URL:', url);
    const response = await fetch(url);
    const result = await response.json();
    console.log('📦 返回数据 - 第', page, '页:', result.data?.records?.[0]?.name);
    
    if (result.code === '200' && result.data) {
      const { records, total, current, size, pages } = result.data;
      
      // 转换数据格式以匹配前端组件
      const formattedData = records.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '暂无简介',
        type: CATEGORY_MAP[item.category] || item.category,
        category: item.category,
        size: formatFileSize(item.packageSize),
        imageUrl: replaceLocalhost(item.coverImage),
        previewModelUrl: replaceLocalhost(item.previewModelUrl),
        downloadCount: item.downloadCount || 0,
        viewCount: item.viewCount || 0,
        likeCount: item.viewCount || 0,
        isLiked: false,
        createdAt: item.createTime ? new Date(item.createTime).toISOString() : null,
        packageName: item.packageName,
      }));
      
      return {
        data: formattedData,
        total: total,
        page: current,
        pageSize: size,
        totalPages: pages
      };
    } else {
      console.error('API 返回错误:', result.msg);
      return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }
};
