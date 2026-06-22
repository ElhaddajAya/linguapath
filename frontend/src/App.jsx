// App.jsx — mis à jour avec LangueProvider pour le switch FR/EN
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { LangueProvider } from "./contexts/LangueContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Quiz from "./pages/Quiz";
import Scenarios from "./pages/Scenario";
import Chat from "./pages/Chat";
import Historique from "./pages/Historique";
import HistoriqueDetail from "./pages/HistoriqueDetail";
import LearningLog from "./pages/LearningLog";
import MindMap from "./pages/MindMap";
import AdminUsers from "./pages/AdminUsers";
import AdminScenarios from "./pages/AdminScenarios";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import GoogleSuccess from "./pages/GoogleSuccess";

export default function App() {
  const [token] = useState(localStorage.getItem("token"));

  return (
    // LangueProvider entoure tout — toutes les pages ont accès à t(), langue, toggleLangue
    <LangueProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing publique */}
          <Route
            path='/'
            element={
              token ? (
                <Navigate
                  to='/home'
                  replace
                />
              ) : (
                <Landing />
              )
            }
          />

          {/* Auth classique */}
          <Route
            path='/login'
            element={<Login />}
          />
          <Route
            path='/signup'
            element={<Signup />}
          />

          {/* Nouvelles routes auth */}
          <Route
            path='/verify-email'
            element={<VerifyEmail />}
          />
          <Route
            path='/forgot-password'
            element={<ForgotPassword />}
          />
          <Route
            path='/reset-password'
            element={<ResetPassword />}
          />
          <Route
            path='/auth/google/success'
            element={<GoogleSuccess />}
          />

          {/* Routes protégées */}
          <Route
            path='/home'
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path='/quiz'
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path='/scenarios'
            element={
              <ProtectedRoute>
                <Scenarios />
              </ProtectedRoute>
            }
          />
          <Route
            path='/chat/:scenarioId'
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path='/historique'
            element={
              <ProtectedRoute>
                <Historique />
              </ProtectedRoute>
            }
          />
          <Route
            path='/historique/:id'
            element={
              <ProtectedRoute>
                <HistoriqueDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path='/learning-log'
            element={
              <ProtectedRoute>
                <LearningLog />
              </ProtectedRoute>
            }
          />
          <Route
            path='/mindmap'
            element={
              <ProtectedRoute>
                <MindMap />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path='/admin/users'
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path='/admin/scenarios'
            element={
              <AdminRoute>
                <AdminScenarios />
              </AdminRoute>
            }
          />

          <Route
            path='*'
            element={
              <Navigate
                to='/'
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </LangueProvider>
  );
}
