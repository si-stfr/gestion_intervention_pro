import { useEffect, useState } from "react";
import "../assets/CSS_JS/global.css";
import api from "../api/api";
import "../assets/CSS_JS/LateAlert.css";
import { createPath } from "react-router-dom";
import { createPortal } from "react-dom";

export default function LateAlert(){

const [showRetardModal, setShowRetardModal] = useState(false);
const [nbRetards, setNbRetards] = useState(0);

 const user = JSON.parse(localStorage.getItem("user"));

const isAdmin = user?.profil === "ADMIN";
const isTech = user?.profil === "TECHNICIEN";
const isManager = user?.profil === "MANAGER";
const isIntervenant = user?.profil === "INTERVENANT";



useEffect(() => {
  const fetchLate = async () => {
    try {
      const res = await api.get("/intervention/late");
      setNbRetards(res.data.length);
      // setInterventionsLate(res.data);
      console.log("DATA",res.data)
      const justLoggedIn = localStorage.getItem("justLoggedIn");
      console.log("ItemLOG",justLoggedIn)
      if (res.data.length > 0 && justLoggedIn === "true") {
        setShowRetardModal(true);
        localStorage.removeItem("justLoggedIn")
      }

    } catch (err) {
      console.error(err);
    }
  };

  fetchLate();
}, []);


if (!showRetardModal) {
    return null;
}

let title = "";
let message = "";


 if (isAdmin) {
    title = "⚠️ Interventions en retard";
    message = `Il y a ${nbRetards} intervention(s) en retard.`;
  }

  if (isTech) {
    title = "⚠️ Votre planning";
    message = `Vous avez ${nbRetards} intervention(s) en retard sur votre planning.`;
  }

  if (isManager) {
    title = "⚠️ Validation en attente";
    message = `Vous avez ${nbRetards} intervention(s) en attente de validation.`;
  }

  if (isIntervenant) {
    title = "⚠️ Interventions en retard";
    message = `Il y a ${nbRetards} intervention(s) en retard.`;
  }

return createPortal(
      <div className="modal-overlay">
        <div className="modal-retard">
          <h2>{title}</h2>
          <p>{message}</p>

          <button
            onClick={() => setShowRetardModal(false)}
          >
            Fermer
          </button>
        </div>
      </div>,
      document.body
)}