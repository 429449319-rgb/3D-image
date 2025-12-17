import React from 'react';
import { Html } from '@react-three/drei';

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
          <div style={{ 
            color: 'red', 
            background: 'rgba(255,255,255,0.9)', 
            padding: 20, 
            borderRadius: 8, 
            textAlign: 'center' 
          }}>
            <h3>模型加载失败</h3>
            <p>{this.state.error.message}</p>
            <p>请确认模型文件存在</p>
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
