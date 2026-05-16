import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";         // ← S8 : guard admin
import Quiz from "./pages/Quiz";
import Scenarios from "./pages/Scenario";
import Chat from "./pages/Chat";
import Historique from "./pages/Historique";
import HistoriqueDetail from "./pages/HistoriqueDetail";
import LearningLog from "./pages/LearningLog";
import MindMap from "./pages/MindMap";
import AdminUsers from "./pages/AdminUsers";               // ← S8 : LIN-41
import AdminScenarios from "./pages/AdminScenarios";       // ← S8 : LIN-42

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Routes protégées — utilisateur connecté */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/scenarios" element={<ProtectedRoute><Scenarios /></ProtectedRoute>} />
        <Route path="/chat/:scenarioId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/historique" element={<ProtectedRoute><Historique /></ProtectedRoute>} />
        <Route path="/historique/:id" element={<ProtectedRoute><HistoriqueDetail /></ProtectedRoute>} />
        <Route path="/learning-log" element={<ProtectedRoute><LearningLog /></ProtectedRoute>} />
        <Route path="/mindmap" element={<ProtectedRoute><MindMap /></ProtectedRoute>} />

        {/* ── Routes admin — S8 ── */}
        {/* AdminRoute vérifie : connecté + role === 'admin' */}
        <Route
          path="/admin/users"
          element={<AdminRoute><AdminUsers /></AdminRoute>}
        />
        <Route
          path="/admin/scenarios"
          element={<AdminRoute><AdminScenarios /></AdminRoute>}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}