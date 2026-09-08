import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import "../../assets/CSS_JS/layout.css";
import "../../assets/CSS_JS/global.css";

export default function MainLayout({ children }) {
  return (
    <div className="layout">

      <Sidebar />

      <div className="main">

        <Topbar />

        <div className="content">
          {children}
        </div>

      </div>

    </div>
  );
}