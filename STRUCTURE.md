# 项目结构说明

## 📊 组件依赖关系图

```
App.jsx (主应用)
│
├─── Header (顶部导航)
│    └─── NAV_ITEMS (常量)
│
├─── Sidebar (侧边栏)
│    ├─── CATEGORIES (常量)
│    └─── CATEGORY_MAP (常量)
│
├─── ModelGrid (模型网格)
│    └─── ModelCard (模型卡片)
│         └─── CardModelPreview (3D预览)
│              ├─── GLBModel (模型加载)
│              ├─── CameraController (相机控制)
│              └─── CardPreviewLoader (加载器)
│
├─── Pagination (分页)
│    └─── PAGE_SIZE_OPTIONS (常量)
│
└─── ModelModal (详情弹窗)
     ├─── ModelViewer (3D查看器)
     │    ├─── GLBModel (模型加载)
     │    ├─── ViewAngleController (视角控制)
     │    ├─── ErrorBoundary (错误边界)
     │    └─── Loader (加载器)
     └─── VIEW_PRESETS (常量)
```

## 🗂️ 文件功能矩阵

| 文件路径 | 功能 | 依赖 | 被依赖 |
|---------|------|------|--------|
| **constants/** | | | |
| `categories.js` | 分类配置 | - | Sidebar, modelService |
| `viewPresets.js` | 视角预设 | - | ModelModal, ViewAngleController |
| `config.js` | 全局配置 | - | Header, Pagination, modelService |
| **utils/** | | | |
| `formatters.js` | 格式化工具 | config | modelService |
| **services/** | | | |
| `modelService.js` | API服务 | constants, utils | App |
| **components/3d/** | | | |
| `ErrorBoundary.jsx` | 错误处理 | drei | ModelViewer |
| `Loader.jsx` | 主加载器 | drei | ModelViewer |
| `CardPreviewLoader.jsx` | 卡片加载器 | drei | CardModelPreview |
| `GLBModel.jsx` | 模型加载 | drei, three | ModelViewer, CardModelPreview |
| `CameraController.jsx` | 相机控制 | fiber | ModelViewer, CardModelPreview |
| `ViewAngleController.jsx` | 视角控制 | fiber, constants | ModelViewer |
| `CardModelPreview.jsx` | 卡片预览 | 3d组件 | ModelCard |
| `ModelViewer.jsx` | 模型查看器 | 3d组件 | ModelModal |
| **components/layout/** | | | |
| `Header.jsx` | 顶部导航 | constants | App |
| `Sidebar.jsx` | 侧边栏 | constants | App |
| **components/model/** | | | |
| `ModelCard.jsx` | 模型卡片 | 3d组件 | ModelGrid |
| `ModelGrid.jsx` | 模型网格 | ModelCard | App |
| `ModelModal.jsx` | 详情弹窗 | 3d组件, constants | App |
| **components/ui/** | | | |
| `Pagination.jsx` | 分页组件 | constants | App |

## 🔄 数据流向

```
用户操作
   ↓
App.jsx (状态管理)
   ↓
modelService.js (API调用)
   ↓
后端API
   ↓
modelService.js (数据格式化)
   ↓
App.jsx (更新状态)
   ↓
子组件 (渲染UI)
```

## 📦 模块分类

### 1. 展示型组件 (Presentational Components)
纯UI展示，不包含业务逻辑：
- `Header.jsx`
- `Pagination.jsx`
- `Loader.jsx`
- `CardPreviewLoader.jsx`

### 2. 容器型组件 (Container Components)
包含状态和业务逻辑：
- `App.jsx`
- `ModelGrid.jsx`
- `ModelCard.jsx`
- `ModelModal.jsx`

### 3. 功能型组件 (Functional Components)
提供特定功能：
- `ErrorBoundary.jsx`
- `CameraController.jsx`
- `ViewAngleController.jsx`

### 4. 复合型组件 (Composite Components)
组合多个子组件：
- `Sidebar.jsx`
- `ModelViewer.jsx`
- `CardModelPreview.jsx`

## 🎯 组件职责

### App.jsx
- ✅ 全局状态管理
- ✅ 数据获取和更新
- ✅ 事件处理协调
- ✅ 路由逻辑（如有）

### 3D 组件
- ✅ Three.js 场景管理
- ✅ 模型加载和渲染
- ✅ 相机和视角控制
- ✅ 加载状态显示

### 布局组件
- ✅ 页面结构布局
- ✅ 导航和筛选
- ✅ 响应式设计

### 模型组件
- ✅ 模型数据展示
- ✅ 用户交互处理
- ✅ 详情弹窗管理

### UI 组件
- ✅ 通用交互控件
- ✅ 可复用UI元素

## 🔧 扩展指南

### 添加新的 3D 功能
1. 在 `components/3d/` 创建新组件
2. 在 `components/3d/index.js` 导出
3. 在需要的地方导入使用

### 添加新的页面布局
1. 在 `components/layout/` 创建新组件
2. 在 `App.jsx` 中引入
3. 更新路由配置（如有）

### 添加新的 API
1. 在 `services/modelService.js` 添加函数
2. 在 `App.jsx` 中调用
3. 更新状态管理

### 添加新的配置
1. 在 `constants/` 对应文件添加
2. 在 `constants/index.js` 导出
3. 在组件中导入使用

## 📏 代码规范

### 命名约定
- **组件**: PascalCase (如 `ModelCard.jsx`)
- **函数**: camelCase (如 `handleClick`)
- **常量**: UPPER_SNAKE_CASE (如 `API_BASE_URL`)
- **文件夹**: kebab-case 或 camelCase

### 导入顺序
1. React 相关
2. 第三方库
3. 本地组件
4. 工具函数
5. 常量配置
6. 样式文件

### 组件结构
```jsx
// 1. 导入
import React from 'react';

// 2. 类型定义（如使用 TypeScript）
// interface Props { ... }

// 3. 组件定义
const Component = ({ prop1, prop2 }) => {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. 事件处理函数
  const handleClick = () => { ... };
  
  // 6. 渲染
  return <div>...</div>;
};

// 7. 导出
export default Component;
```

## 🎨 样式组织

所有样式集中在 `index.css`，按以下顺序组织：
1. 全局样式
2. 布局样式 (header, sidebar, main)
3. 组件样式 (card, modal, pagination)
4. 响应式样式 (@media queries)

## 🧪 测试策略

### 单元测试
- 测试独立组件
- 测试工具函数
- 测试服务层

### 集成测试
- 测试组件交互
- 测试数据流
- 测试用户操作流程

### E2E 测试
- 测试完整用户场景
- 测试跨页面流程

---

**文档版本**: 1.0
**最后更新**: 2024
