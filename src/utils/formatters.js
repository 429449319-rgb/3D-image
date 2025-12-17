// 格式化文件大小
export const formatFileSize = (bytes) => {
  if (!bytes) return '未知';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

// 替换URL，通过本地代理访问文件服务器（解决跨域问题）
export const replaceLocalhost = (url) => {
  if (!url) return null;
  // 将完整URL转换为代理路径，例如：
  // http://127.0.0.1:9001/sanweifile/xxx -> /sanweifile/xxx
  // http://10.213.19.130:9001/sanweifile/xxx -> /sanweifile/xxx
  const FILE_SERVER_IP = '10.213.19.130';
  return url
    .replace('http://127.0.0.1:9001', '')
    .replace(`http://${FILE_SERVER_IP}:9001`, '');
};
