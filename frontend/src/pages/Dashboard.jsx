import { Navigate } from "react-router-dom";

export default function Dashboard() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (!user) {

    return <Navigate to="/" />;
  }

  switch (user.profil) {

    case "ADMIN":
      return <Navigate to="/admin" />;

    case "Technicien":
      return <Navigate to="/technicien" />;

    default:
      return <Navigate to="/intervenant" />;
  }
}