import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, useFBX, useGLTF, Center, Html, useProgress } from '@react-three/drei';

// 简单的错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div style={{ color: 'red', background: 'rgba(255,255,255,0.9)', padding: 20, borderRadius: 8, textAlign: 'center' }}>
            <h3>模型加载失败</h3>
            <p>{this.state.error.message}</p>
            <p>请确认 public/models/robot.fbx 文件存在</p>
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

import * as THREE from 'three'; // 引入 THREE

// ==================== 3D 模型加载组件 ====================
function FBXModel({ url }) {
  useEffect(() => {
    console.log('>>> FBXModel 组件已挂载 (测试模式)');
    return () => console.log('<<< FBXModel 组件已卸载');
  }, []);

  return (
    <group>
      {/* 测试用的红色立方体 */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      {/* 辅助网格，帮助看清空间 */}
      <gridHelper args={[10, 10]} />
    </group>
  );
}

// ==================== GLB/GLTF 模型组件（带相机自适应）====================
function GLBModel({ url, onModelLoaded }) {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (clonedScene && !hasLoaded.current) {
      hasLoaded.current = true;
      
      const box = new THREE.Box3().setFromObject(clonedScene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = box.getCenter(new THREE.Vector3());
      
      // 计算模型信息
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // 将模型居中到原点
      clonedScene.position.set(-center.x, -center.y, -center.z);
      
      // 回调通知父组件模型尺寸，用于调整相机
      if (onModelLoaded) {
        onModelLoaded({ size, center, maxDim });
      }
    }
  }, [clonedScene, onModelLoaded]);

  return <primitive object={clonedScene} />;
}

// ==================== 相机自适应控制器 ====================
function CameraController({ modelInfo, controlsRef, viewPreset }) {
  const { camera } = useThree();
  const hasAdjusted = useRef(false);
  
  useEffect(() => {
    // 只在模型首次加载时调整相机，避免干扰用户操作
    if (modelInfo && controlsRef.current && !hasAdjusted.current) {
      const { maxDim } = modelInfo;
      
      // 根据模型大小计算最佳相机距离
      const fov = camera.fov * (Math.PI / 180);
      const distance = (maxDim / 2) / Math.tan(fov / 2) * 1.8; // 1.8 倍余量
      const cameraDistance = Math.max(distance, 3); // 最小距离为 3
      
      // 如果有视角预设，使用预设方向但调整距离
      if (viewPreset) {
        const [px, py, pz] = viewPreset;
        const presetLength = Math.sqrt(px * px + py * py + pz * pz);
        // 保持预设方向，但使用自适应距离
        const scale = cameraDistance / presetLength;
        camera.position.set(px * scale, py * scale, pz * scale);
      } else {
        camera.position.set(cameraDistance * 0.7, cameraDistance * 0.4, cameraDistance * 0.9);
      }
      
      camera.updateProjectionMatrix();
      
      // 更新 OrbitControls 的目标点
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      
      hasAdjusted.current = true;
      console.log('📷 相机已自适应，距离:', cameraDistance.toFixed(2));
    }
  }, [modelInfo, camera, controlsRef, viewPreset]);
  
  // 当 modelInfo 变为 null 时（切换视角），重置标记
  useEffect(() => {
    if (!modelInfo) {
      hasAdjusted.current = false;
    }
  }, [modelInfo]);
  
  return null;
}

// ==================== FBX 模型组件 ====================
function RobotModel({ url }) {
  const fbx = useFBX(url);
  const fbxClone = fbx.clone();

  useEffect(() => {
    if (fbxClone) {
      const box = new THREE.Box3().setFromObject(fbxClone);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = box.getCenter(new THREE.Vector3());
      
      console.log('============ FBX 模型加载成功 ============');
      console.log('模型尺寸(宽x高x深):', size.x.toFixed(2), 'x', size.y.toFixed(2), 'x', size.z.toFixed(2));
      console.log('模型中心:', center);
      console.log('========================================');
    }
  }, [fbxClone]);

  return <primitive object={fbxClone} scale={0.003} />;
}

// 加载进度条组件
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', 
        padding: '40px 50px', 
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        textAlign: 'center',
        minWidth: '280px'
      }}>
        {/* 加载动画图标 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            margin: '0 auto',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #FF6B35',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
        
        {/* 标题 */}
        <div style={{ 
          fontSize: '18px', 
          color: '#333', 
          marginBottom: '8px',
          fontWeight: '600'
        }}>
          正在加载 3D 模型
        </div>
        
        {/* 提示文字 */}
        <div style={{ 
          fontSize: '13px', 
          color: '#888', 
          marginBottom: '20px'
        }}>
          首次加载可能需要几秒钟，请耐心等待
        </div>
        
        {/* 进度条容器 */}
        <div style={{
          width: '100%',
          height: '8px',
          background: '#e9ecef',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          {/* 进度条填充 */}
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #FF6B35 0%, #FF8F5E 100%)',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        {/* 百分比显示 */}
        <div style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#FF6B35',
          letterSpacing: '1px'
        }}>
          {progress.toFixed(0)}%
        </div>
      </div>
      
      {/* CSS 动画 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Html>
  );
}

// 视角预设名称和图标（与 ViewAngleController 的 switch 顺序对应）
const VIEW_PRESETS = [
  { name: '正面', icon: '🎯' },   // 0: 从前方看
  { name: '背面', icon: '🔙' },   // 1: 从后方看
  { name: '左侧', icon: '◀' },    // 2: 从左侧看
  { name: '右侧', icon: '▶' },    // 3: 从右侧看
  { name: '顶部', icon: '🔽' },   // 4: 从上方看
  { name: '底部', icon: '🔼' },   // 5: 从下方看
];

// ==================== 卡片预览加载指示器 ====================
const CardPreviewLoader = () => {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #f0f0f0',
          borderTop: '3px solid #FF6B35',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ 
          fontSize: '12px', 
          color: '#666',
          background: 'rgba(255,255,255,0.9)',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          加载中...
        </span>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Html>
  );
};

// ==================== 卡片悬停 3D 预览组件 ====================
const CardModelPreview = ({ modelUrl }) => {
  const [modelInfo, setModelInfo] = useState(null);
  const controlsRef = useRef();

  return (
    <Canvas
      style={{ background: 'transparent' }}
      camera={{ position: [0, 1, 5], fov: 50 }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <Suspense fallback={<CardPreviewLoader />}>
        {modelUrl && <GLBModel url={modelUrl} onModelLoaded={setModelInfo} />}
      </Suspense>
      <CameraController modelInfo={modelInfo} controlsRef={controlsRef} />
      <OrbitControls 
        ref={controlsRef}
        enableZoom={false} 
        enablePan={false}
        autoRotate 
        autoRotateSpeed={4} 
      />
    </Canvas>
  );
};

// ==================== 模型卡片组件（带悬停预览）====================
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

// ==================== 视角控制器组件 ====================
function ViewAngleController({ viewIndex, modelInfo, controlsRef }) {
  const { camera } = useThree();
  const lastViewIndex = useRef(viewIndex);
  const hasInitialized = useRef(false);

  // 计算目标位置
  const getTargetPosition = (index, dist) => {
    switch (index) {
      case 0: return [0, 0, dist];           // 正面
      case 1: return [0, 0, -dist];          // 背面
      case 2: return [dist, 0, 0];           // 左侧
      case 3: return [-dist, 0, 0];          // 右侧
      case 4: return [0, dist, 0.001];       // 顶部
      case 5: return [0, -dist, 0.001];      // 底部
      default: return [0, 0, dist];
    }
  };

  useEffect(() => {
    if (!modelInfo || !controlsRef.current) return;
    
    const isViewChanged = lastViewIndex.current !== viewIndex;
    if (hasInitialized.current && !isViewChanged) return;
    
    const { maxDim } = modelInfo;
    // 计算合适的相机距离：让模型占据视口约70%
    const fov = camera.fov * (Math.PI / 180);
    const optimalDist = (maxDim / 2) / Math.tan(fov / 2) * 1.2;
    const targetDist = Math.max(optimalDist, 2);
    const targetPos = getTargetPosition(viewIndex, targetDist);
    
    // 直接设置相机位置
    camera.position.set(targetPos[0], targetPos[1], targetPos[2]);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
    
    lastViewIndex.current = viewIndex;
    hasInitialized.current = true;
    console.log(`📷 视角: ${VIEW_PRESETS[viewIndex].name}, 距离: ${targetDist.toFixed(2)}`);
  }, [viewIndex, modelInfo, camera, controlsRef]);

  return null;
}

// ==================== 3D 模型查看器组件 ====================
const ModelViewer = ({ modelUrl, activeView = 0 }) => {
  const containerRef = useRef(null);
  const controlsRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

  // 切换全屏
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('全屏失败:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // 监听全屏变化事件
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative', 
        background: isFullscreen ? '#1a1a1a' : '#f5f5f5',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
        <Canvas 
          style={{ background: 'radial-gradient(circle at center, #ffffff 0%, #e0e0e0 50%, #333333 100%)' }}
          camera={{ position: [0, 0, 10], fov: 50 }}
          onCreated={() => console.log('✅ Canvas 已创建，开始加载模型...')}
          onError={(error) => console.error('❌ Canvas 错误:', error)}
        >
          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} intensity={0.6} />
              <directionalLight position={[-5, -5, -5]} intensity={0.3} />
              
              {modelUrl ? (
                <GLBModel url={modelUrl} onModelLoaded={setModelInfo} />
              ) : (
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="#cccccc" />
                </mesh>
              )}
            </Suspense>
          </ErrorBoundary>
          
          <ViewAngleController viewIndex={activeView} modelInfo={modelInfo} controlsRef={controlsRef} />
          <OrbitControls ref={controlsRef} makeDefault autoRotate autoRotateSpeed={0.5} />
        </Canvas>

        {/* 全屏按钮 */}
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 100
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 107, 53, 0.9)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.6)'}
          title={isFullscreen ? '退出全屏' : '全屏查看'}
        >
          {isFullscreen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          )}
        </button>

        {/* 全屏模式下的提示 */}
        {isFullscreen && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.6)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            zIndex: 100
          }}>
            按 ESC 或点击右下角按钮退出全屏
          </div>
        )}
    </div>
  );
};

// ==================== API 配置 ====================
// 后端服务器地址（通过代理访问，解决跨域问题）
const API_BASE_URL = '/api';
// 文件服务器地址（需要替换 127.0.0.1 为同事的IP）
const FILE_SERVER_IP = '10.213.19.130';

// 替换URL，通过本地代理访问文件服务器（解决跨域问题）
const replaceLocalhost = (url) => {
  if (!url) return null;
  // 将完整URL转换为代理路径，例如：
  // http://127.0.0.1:9001/sanweifile/xxx -> /sanweifile/xxx
  // http://10.213.19.130:9001/sanweifile/xxx -> /sanweifile/xxx
  return url
    .replace('http://127.0.0.1:9001', '')
    .replace(`http://${FILE_SERVER_IP}:9001`, '');
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '未知';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

// 分类映射（英文转中文）
const CATEGORY_MAP = {
  'furniture': '家具',
  'prop': '道具',
  'architecture': '建筑',
  'robot': '机器人',
  'vehicle': '载具',
  'character': '角色',
};

// 从后端获取数据
const fetchModelsFromAPI = async (page = 1, pageSize = 10, category = '', keyword = '') => {
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

function App() {
  // 状态管理
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(16); // 默认16条 (4x4)
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [currentCategory, setCurrentCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInputValue, setSearchInputValue] = useState(''); // 搜索框显示的值
  const [pageInputValue, setPageInputValue] = useState(1);

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [currentMainImage, setCurrentMainImage] = useState('');
  const [activeView, setActiveView] = useState(0); // 3D 模型视角
  
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

  // 事件处理
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      doSearch();
    }
  };

  // 执行搜索
  const doSearch = () => {
    setSearchKeyword(searchInputValue.trim());
    setCurrentPage(1);
  };

  // 输入框内容变化
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInputValue(value);
    // 如果清空了输入框，则重置搜索
    if (value === '' && searchKeyword !== '') {
      setSearchKeyword('');
      setCurrentPage(1);
    }
  };

  const handleCategoryClick = (category) => {
    if (category === 'XXXXX') return;
    setCurrentCategory(category === currentCategory ? '' : category);
    setSearchKeyword(''); // 点击分类时清空搜索关键词
    setSearchInputValue(''); // 清空搜索框内容
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDownload = (e, model) => {
    e.stopPropagation();
    alert(`开始下载模型: ${model.name}`);
  };

  
  const openModal = (model) => {
    setCurrentModel({ ...model }); 
    setCurrentMainImage(model.imageUrl);
    setActiveView(0); // 重置视角为正面
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

      // 更新列表中对应模型的状态（可选，为了更好体验）
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
            {['首页', '三维物体', '机器人', '仿真场景库', '软件下载', '品牌入驻', '联系我们'].map((item) => (
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

      {/* 主内容区域 */}
      <div className="main-container">
        {/* 左侧边栏 */}
        <aside className="sidebar">
          <div className="sidebar-title">目录</div>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="请输入物品名称搜索" 
              className="search-input"
              value={searchInputValue}
              onKeyPress={handleSearch}
              onChange={handleSearchInputChange}
            />
            <button 
              className="search-btn"
              onClick={doSearch}
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
                onClick={() => { setSearchKeyword(''); setSearchInputValue(''); setCurrentPage(1); }}
              >
                清除
              </span>
            </div>
          )}
          <ul className="category-list">
            {['furniture', 'prop', 'architecture', 'robot', 'vehicle', 'character'].map((cat, index) => (
              <li className="category-item" key={index}>
                <a 
                  href="#" 
                  className={`category-link ${currentCategory === cat ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleCategoryClick(cat); }}
                >
                  {CATEGORY_MAP[cat] || cat}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* 主内容区 */}
        <main className="content-area">
          {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>加载中...</div>
          ) : models.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>暂无数据</div>
          ) : (
            <div className="model-grid">
              {models.map(model => (
                <ModelCard 
                  key={model.id} 
                  model={model} 
                  onOpenModal={openModal} 
                  onDownload={handleDownload} 
                />
              ))}
            </div>
          )}

          {/* 分页控件 */}
          <div className="pagination">
            <div className="pagination-info">
              <span>共{totalItems}条</span>
            </div>
            <div className="pagination-controls">
              <select 
                className="page-size-select" 
                value={pageSize} 
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value="16">16条/页</option>
                <option value="32">32条/页</option>
                <option value="64">64条/页</option>
              </select>
              
              <div className="page-numbers">
                <button className="page-btn" onClick={() => handlePageChange(currentPage - 1)}>‹</button>
                
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
                       onClick={() => handlePageChange(p)}
                     >
                       {p}
                     </button>
                   );
                })}
                
                <button className="page-btn" onClick={() => handlePageChange(currentPage + 1)}>›</button>
              </div>
              
              <div className="page-jump">
                <span>前往</span>
                <input 
                  type="number" 
                  className="page-input" 
                  value={pageInputValue}
                  min="1" 
                  max={totalPages}
                  onChange={(e) => setPageInputValue(e.target.value)}
                  onBlur={() => {
                    const p = parseInt(pageInputValue);
                    if (p >= 1 && p <= totalPages) handlePageChange(p);
                    else setPageInputValue(currentPage);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const p = parseInt(pageInputValue);
                      if (p >= 1 && p <= totalPages) handlePageChange(p);
                    }
                  }}
                />
                <span>页</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 模型详情弹窗 */}
      <div className={`modal-overlay ${modalOpen ? 'active' : ''}`} onClick={(e) => e.target.classList && e.target.classList.contains('modal-overlay') && closeModal()}>
        <div className="modal-container">
          <button className="modal-close-btn" onClick={closeModal}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {currentModel && (
            <div className="modal-content">
              {/* 左侧：图片展示区 */}
              <div className="modal-gallery">
                <div className="main-image-container" style={{ height: '400px', width: '100%', position: 'relative' }}>
                   <ModelViewer modelUrl={currentModel.previewModelUrl} activeView={activeView} />
                </div>
                {/* 视角预览按钮 */}
                <div className="thumbnail-list" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  {VIEW_PRESETS.map((view, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveView(index)}
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
                <h2 className="modal-title" dangerouslySetInnerHTML={{ __html: currentModel.name }} />
                
                <div className="modal-description-container">
                  <p className="modal-description" style={{whiteSpace: 'pre-line'}}>
                    {currentModel.description}
                  </p>
                </div>

                <div className="modal-actions">
                  <button className="modal-download-btn" onClick={(e) => handleDownload(e, currentModel)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
                      <path d="M12 15V3M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L2.621 19.485C2.84902 20.3978 3.67376 21 4.61473 21H19.3853C20.3262 21 21.151 20.3978 21.379 19.485L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    下载
                  </button>

                  <div className="secondary-actions">
                    <button className={`action-btn like-btn ${currentModel.isLiked ? 'active' : ''}`} onClick={handleLike}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="icon-normal" style={{display: currentModel.isLiked ? 'none' : 'block'}}>
                        <path d="M10 17.25L8.7625 16.1225C4.3625 12.135 1.45 9.5 1.45 6.275C1.45 3.6375 3.525 1.575 6.1625 1.575C7.65 1.575 9.075 2.2625 10 3.3375C10.925 2.2625 12.35 1.575 13.8375 1.575C16.475 1.575 18.55 3.6375 18.55 6.275C18.55 9.5 15.6375 12.135 11.2375 16.135L10 17.25Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="#FF6B35" className="icon-active" style={{display: currentModel.isLiked ? 'block' : 'none'}}>
                        <path d="M10 17.25L8.7625 16.1225C4.3625 12.135 1.45 9.5 1.45 6.275C1.45 3.6375 3.525 1.575 6.1625 1.575C7.65 1.575 9.075 2.2625 10 3.3375C10.925 2.2625 12.35 1.575 13.8375 1.575C16.475 1.575 18.55 3.6375 18.55 6.275C18.55 9.5 15.6375 12.135 11.2375 16.135L10 17.25Z" fill="#FF6B35"/>
                      </svg>
                      <span>{currentModel.likeCount}</span>
                    </button>
                    <button className="action-btn share-btn" onClick={handleShare}>
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
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
