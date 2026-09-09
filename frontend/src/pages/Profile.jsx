import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../assets/CSS_JS/Profile.css";
import "../assets/CSS_JS/global.css";

export default function Profile() {

  const storedUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [user] = useState(storedUser);

  return (

    <div className="layout">

      <Sidebar />

      <div className="page-content">

        <h1 className="profile-title">
          Mon profil
        </h1>

        <div className="profile-card">

          <div className="profile-row">
            <strong className="nom-label">
              Nom :
            </strong>

            <span>
              {user?.username || "-"}
            </span>
          </div>

          <div className="profile-row">
            <strong className="email-label">
              Email :
            </strong>

            <span>
              {user?.email || "-"}
            </span>
          </div>

          <div className="profile-row">
            <strong className="telephone-label">
              Téléphone :
            </strong>

            <span>
              {
                user?.telephone ||
                user?.phone ||
                "-"
              }
            </span>
          </div>

          <div className="profile-row">
            <strong className="profil-label">
              Profil :
            </strong>

            <span>
              {user?.profil || "-"}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}