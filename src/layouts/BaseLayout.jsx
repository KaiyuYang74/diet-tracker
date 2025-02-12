import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function BaseLayout({ children }) {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="content">{children}</main>
      <Footer />
    </div>
  );
}

export default BaseLayout;
