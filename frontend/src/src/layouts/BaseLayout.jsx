import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubNavbar from "../components/SubNavbar";
import Footer from "../components/Footer";

function BaseLayout({ children }) {
  const location = useLocation();
  
  // 定义需要显示子导航栏的路径（功能页面）
  const showSubNavPaths = ['/home', '/goals', '/diet', '/exercise'];
  
  // 定义固定高度的页面（登录相关页面）
  const fixedHeightPaths = ['/', '/login', '/register', '/set-goal', '/fill-details'];
  
  // 定义不需要显示页脚的页面
  const hideFooterPaths = ['/set-goal', '/fill-details'];
  
  const shouldShowSubNav = showSubNavPaths.includes(location.pathname);
  const isFixedHeight = fixedHeightPaths.includes(location.pathname);
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <div className={`layout-container ${isFixedHeight ? 'fixed-height' : ''}`}>
      <Navbar />
      {shouldShowSubNav && <SubNavbar />}
      <main className={`content ${isFixedHeight ? 'fixed-content' : 'scrollable-content'}`}>
        {children}
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default BaseLayout;