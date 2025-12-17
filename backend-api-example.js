/**
 * 后端API示例 - Node.js + Express
 * 这是一个示例后端服务器，展示如何实现图片数据接口
 * 
 * 安装依赖:
 * npm install express cors multer
 * 
 * 运行服务器:
 * node backend-api-example.js
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 用于提供图片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== 模拟数据 ====================
const modelTypes = ['人形机器人', '机械臂', '机械狗', '工业机器人', '服务机器人', '医疗机器人'];

// 生成模拟数据
function generateMockModels(total = 600) {
    const models = [];
    for (let i = 1; i <= total; i++) {
        const typeIndex = Math.floor(Math.random() * modelTypes.length);
        const size = (Math.random() * 10 + 0.5).toFixed(2);
        const unit = Math.random() > 0.5 ? 'MB' : 'KB';
        const type = modelTypes[typeIndex];
        
        models.push({
            id: i,
            name: `机器人模型${i}号-${type}`,
            size: `${size}${unit}`,
            type: type,
            imageUrl: `/api/models/${i}/image`, // 图片URL
            thumbnailUrl: `/api/models/${i}/thumbnail`, // 缩略图URL
            description: `这是一个${type}的3D模型，包含完整的材质和贴图信息。`,
            createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
            downloads: Math.floor(Math.random() * 10000),
            rating: (Math.random() * 2 + 3).toFixed(1) // 3-5分
        });
    }
    return models;
}

const allModels = generateMockModels();

// ==================== API 路由 ====================

/**
 * 获取模型列表（分页）
 * GET /api/models?page=1&pageSize=10&category=人形机器人
 */
app.get('/api/models', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const category = req.query.category || '';
    
    // 筛选数据
    let filteredModels = allModels;
    if (category) {
        filteredModels = allModels.filter(model => model.type === category);
    }
    
    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = filteredModels.slice(start, end);
    
    // 返回响应
    res.json({
        success: true,
        data: paginatedData,
        total: filteredModels.length,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(filteredModels.length / pageSize)
    });
});

/**
 * 搜索模型
 * GET /api/models/search?keyword=机械臂&page=1&pageSize=10
 */
app.get('/api/models/search', (req, res) => {
    const keyword = req.query.keyword || '';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    // 搜索
    const searchResults = allModels.filter(model => 
        model.name.toLowerCase().includes(keyword.toLowerCase()) ||
        model.type.toLowerCase().includes(keyword.toLowerCase()) ||
        model.description.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = searchResults.slice(start, end);
    
    res.json({
        success: true,
        data: paginatedData,
        total: searchResults.length,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(searchResults.length / pageSize)
    });
});

/**
 * 获取单个模型详情
 * GET /api/models/:id
 */
app.get('/api/models/:id', (req, res) => {
    const modelId = parseInt(req.params.id);
    const model = allModels.find(m => m.id === modelId);
    
    if (model) {
        res.json({
            success: true,
            data: model
        });
    } else {
        res.status(404).json({
            success: false,
            message: '模型不存在'
        });
    }
});

/**
 * 获取模型图片
 * GET /api/models/:id/image
 */
app.get('/api/models/:id/image', (req, res) => {
    const modelId = parseInt(req.params.id);
    
    // 这里应该从数据库或文件系统获取真实图片
    // 示例：返回占位图或默认图片
    const imagePath = path.join(__dirname, 'uploads', `model-${modelId}.jpg`);
    
    // 检查图片是否存在
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        // 如果图片不存在，返回默认占位图或重定向到占位图服务
        res.redirect(`https://via.placeholder.com/300x200/FF6B35/FFFFFF?text=Model+${modelId}`);
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`后端API服务器运行在 http://localhost:${PORT}`);
    console.log(`API文档:`);
    console.log(`  - 获取模型列表: GET http://localhost:${PORT}/api/models?page=1&pageSize=10`);
    console.log(`  - 搜索模型: GET http://localhost:${PORT}/api/models/search?keyword=机械臂`);
    console.log(`  - 获取模型详情: GET http://localhost:${PORT}/api/models/:id`);
    console.log(`  - 获取模型图片: GET http://localhost:${PORT}/api/models/:id/image`);
});

