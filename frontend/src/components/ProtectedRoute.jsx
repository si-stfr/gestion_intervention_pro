import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
  allowedRoles = []
}) {

  /*
  =========================================================
  TOKEN
  =========================================================
  */

  const token = localStorage.getItem("token");

  /*
  =========================================================
  USER
  =========================================================
  */

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  /*
  =========================================================
  NOT CONNECTED
  =========================================================
  */

  if (!token || !user) {

    return <Navigate to="/" replace />;
  }

  /*
  =========================================================
  ROLE PROTECTION
  =========================================================
  */

  console.log("USER PROFIL:", user.profil);
  console.log("ALLOWED ROLES:", allowedRoles);
  console.log("RAW USER:", user);

  const normalizedRole = (user?.profil || "").trim().toUpperCase();
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(normalizedRole)
    ) {
      return <Navigate to="/unauthorized" replace />;
    }

  /*
  =========================================================
  AUTHORIZED
  =========================================================
  */

  return children;
}