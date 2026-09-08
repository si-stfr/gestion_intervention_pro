import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../api/api";


/*
=========================================================
CONTEXT
=========================================================
*/

const AuthContext = createContext();


/*
=========================================================
PROVIDER
=========================================================
*/

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);


  /*
  =========================================================
  LOAD USER FROM LOCAL STORAGE
  =========================================================
  */

  useEffect(() => {

    const storedUser = localStorage.getItem("user");

    const token = localStorage.getItem("token");

    if (storedUser && token) {

      try {

        setUser(JSON.parse(storedUser));

      } catch (err) {

        console.error(err);

        logout();
      }
    }

    setLoading(false);

  }, []);


  /*
  =========================================================
  LOGIN
  =========================================================
  */

  const login = async (username, password) => {
    try {

      const res = await api.post(
        "/auth/login",
        {
          username,
          password
        }
      );

      const data = res.data;

      localStorage.setItem(
        "token",
        data.access_token
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setUser(data.user);

      return {
        success: true
      };

    } catch (err) {

      console.error(err);

      return {
        success: false,
        message:
          err?.response?.data?.detail ||
          "Erreur de connexion"
      };
    }
  };


  /*
  =========================================================
  REGISTER
  =========================================================
  */

  const register = async (payload) => {

    try {

      await api.post(
        "/auth/register",
        payload
      );

      return {
        success: true
      };

    } catch (err) {

      console.error(err);

      return {
        success: false,
        message:
          err?.response?.data?.detail ||
          "Erreur lors de la création du compte"
      };
    }
  };


  /*
  =========================================================
  LOGOUT
  =========================================================
  */

  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("refresh_token");

    localStorage.removeItem("user");

    setUser(null);
  };


  /*
  =========================================================
  UPDATE USER
  =========================================================
  */

  const updateUser = (updatedUser) => {

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
  };


  /*
  =========================================================
  IS AUTHENTICATED
  =========================================================
  */

  const isAuthenticated = !!user;


  /*
  =========================================================
  ROLE CHECK
  =========================================================
  */

  const hasRole = (roles = []) => {

    if (!user) return false;

    return roles.includes(user.profil);
  };


  /*
  =========================================================
  CONTEXT VALUE
  =========================================================
  */

  const value = {

    user,

    loading,

    isAuthenticated,

    login,

    register,

    logout,

    updateUser,

    hasRole
  };


  return (

    <AuthContext.Provider value={value}>

      {children}

    </AuthContext.Provider>
  );
}


/*
=========================================================
HOOK
=========================================================
*/

export function useAuth() {

  return useContext(AuthContext);
}