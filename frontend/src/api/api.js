import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;

console.log("API_URL =", API_URL)
/*
=========================================================
BASE URL BACKEND
=========================================================
*/

// const API_URL = "http://192.168.10.220:8000";


/*
=========================================================
AXIOS INSTANCE
=========================================================
*/

const api = axios.create({
    baseURL: API_URL,

    headers: {
        "Content-Type": "application/json"
    }
});


/*
=========================================================
REQUEST INTERCEPTOR
Ajoute automatiquement le token JWT
=========================================================
*/

api.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");

        if (token) {

            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


/*
=========================================================
RESPONSE INTERCEPTOR
Gestion automatique des erreurs
=========================================================
*/

api.interceptors.response.use(

    (response) => response,

    async (error) => {

        /*
        -----------------------------------------
        TOKEN EXPIRE
        -----------------------------------------
        */

        if (error.response?.status === 401) {

            const isLoginPage = window.location.pathname === "/";

            console.error("Session expirée");

            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");

            if (!isLoginPage) {
                window.location.href = "/";
            }

            return Promise.reject(error);
    }

        /*
        -----------------------------------------
        FORBIDDEN
        -----------------------------------------
        */

        if (error.response?.status === 403) {

            console.error("Accès refusé");
        }

        /*
        -----------------------------------------
        SERVER ERROR
        -----------------------------------------
        */

        if (error.response?.status === 500) {

            console.error("Erreur serveur");
        }

        return Promise.reject(error);
    }
);


export default api;