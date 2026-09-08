import "../assets/CSS_JS/Topbar.css";

export default function Topbar() {

  const role = localStorage.getItem("role");

  return (
    <div className="topbar">
      <h3>Dashboard</h3>
      <div style={{ display: "flex", alignItems: "center" }}>
        👤 {role}
      </div>
    </div>
  );
}

