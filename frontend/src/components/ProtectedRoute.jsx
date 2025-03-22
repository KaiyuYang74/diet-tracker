import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UNAUTHENTICATED_PAGES = ['/', '/login', '/register'];

const ProtectedRoute = ({ children, redirectPath = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();

  // 加载中时显示加载状态
  if (loading) {
    return <div>Loading...</div>;
  }

  // 特殊处理首页和登录/注册页面
  if (UNAUTHENTICATED_PAGES.includes(window.location.pathname)) {
    return children;
  }

  // 未认证时重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // 已认证时显示子组件
  return children;
};

export default ProtectedRoute;