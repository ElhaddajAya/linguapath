import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";           // ← nouvelle landing page
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

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Landing page publique ── */}
        {/* Si connecté → redirige vers /home, sinon affiche la landing */}
        <Route
          path="/"
          element={token ? <Navigate to="/home" replace /> : <Landing />}
        />

        {/* Routes publiques */}
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Routes protégées */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/scenarios" element={<ProtectedRoute><Scenarios /></ProtectedRoute>} />
        <Route path="/chat/:scenarioId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/historique" element={<ProtectedRoute><Historique /></ProtectedRoute>} />
        <Route path="/historique/:id" element={<ProtectedRoute><HistoriqueDetail /></ProtectedRoute>} />
        <Route path="/learning-log" element={<ProtectedRoute><LearningLog /></ProtectedRoute>} />
        <Route path="/mindmap" element={<ProtectedRoute><MindMap /></ProtectedRoute>} />

        {/* Routes admin */}
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/scenarios" element={<AdminRoute><AdminScenarios /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}