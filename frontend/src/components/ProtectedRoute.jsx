import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, redirectPath = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();

  // 加载中时显示加载状态
  if (loading) {
    return <div>Loading...</div>;
  }

  // 未认证时重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // 已认证时显示子组件
  return children;
};

export default ProtectedRoute;