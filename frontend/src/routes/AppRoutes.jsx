import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

import Dashboard from "../pages/Dashboard";

import Login from "../pages/Login";
import Register from "../pages/Register";

import AdminDashboard from "../pages/AdminDashboard";
import TechnicienDashboard from "../pages/TechnicienDashboard";
import ManagerDashboard from "../pages/ManagerDashboard";
import IntervenantDashboard from "../pages/IntervenantDashboard";

import Interventions from "../pages/Interventions";

import InterventionsAbouties from "../pages/InterventionsAbouties";
import InterventionsImpossible from "../pages/InterventionsImpossible";
import InterventionsImprimer from "../pages/InterventionsImprimer";

import MaterielsPage from "../pages/Materiels";

import PlanningTechniciens from "../pages/PlanningTechniciens";

import Profile from "../pages/Profile";
import Users from "../pages/Users";
import VueEnsemble from "../pages/VueEnsemble";

export default function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =====================================================
            AUTH
        ===================================================== */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =====================================================
            DASHBOARD REDIRECTION
        ===================================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            ADMIN
        ===================================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN"]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN"]}
            >
              <Users />
            </ProtectedRoute>
          }
        />

          <Route 
            path="/materiels" 
            element={
              <ProtectedRoute>
                <MaterielsPage />
              </ProtectedRoute>
            }
          />
        
        {/* =====================================================
            TECHNICIEN
        ===================================================== */}

        <Route
          path="/technicien"
          element={
            <ProtectedRoute
              allowedRoles={[
                "TECHNICIEN"
              ]}
            >
              <TechnicienDashboard />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            MANAGER
        ===================================================== */}
        <Route
            path="/manager"
            element={
                <ProtectedRoute allowedRoles={["MANAGER"]}>
                <ManagerDashboard />
                </ProtectedRoute>
            }
        />


        {/* =====================================================
            INTERVENANT
        ===================================================== */}

        <Route
          path="/intervenant"
          element={
            <ProtectedRoute
              allowedRoles={[
                "INTERVENANT"
              ]}
            >
              <IntervenantDashboard />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            INTERVENTIONS
        ===================================================== */}

        <Route
          path="/interventions"
          element={
            <ProtectedRoute>
              <Interventions />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            ABOUTI
        ===================================================== */}

        <Route
          path="/interventions/abouti"
          element={
            <ProtectedRoute>
              <InterventionsAbouties />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            IMPRIMER
        ===================================================== */}

        <Route
          path="/interventions/imprimer"
          element={
            <ProtectedRoute>
              <InterventionsImprimer />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            IMPOSSIBLE
        ===================================================== */}

        <Route
          path="/interventions/impossible"
          element={
            <ProtectedRoute>
              <InterventionsImpossible />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            PLANNING
        ===================================================== */}

        <Route
          path="/planning"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "TECHNICIEN"
              ]}
            >
              <PlanningTechniciens />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            PROFILE
        ===================================================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            VUE D'ENSEMBLE  
        */}

          <Route
          path="/generalview"
          element={
            <ProtectedRoute
              allowedRoles={["TECHNICIEN", "INTERVENANT", "MANAGER"]}
            >
              <VueEnsemble />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate to="/" />
          }
        />

        <Route
            path="/unauthorized"
            element={<h1>UNAUTHORIZED</h1>}
        />

      </Routes>

    </BrowserRouter>
  );
}