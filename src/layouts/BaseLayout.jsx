import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubNavbar from "../components/SubNavbar";
import Footer from "../components/Footer";

function BaseLayout({ children }) {
  const location = useLocation();
  
  // 定义需要显示子导航栏的路径
  const showSubNavPaths = ['/home', '/goals', '/diet', '/exercise'];
  const shouldShowSubNav = showSubNavPaths.includes(location.pathname);

  return (
    <div className="layout-container">
      <Navbar />
      {shouldShowSubNav && <SubNavbar />}
      <main className="content">{children}</main>
      <Footer />
    </div>
  );
}

export default BaseLayout;