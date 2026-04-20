<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login   from './pages/Login'
import Signup  from './pages/Signup'
import Profile from './pages/Profile'
=======
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Quiz from "./pages/Quiz";
import Scenarios from "./pages/Scenario";
import Chat from "./pages/Chat";
>>>>>>> 9499846433640e4376a4a22cc88688fc14b540c7

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/login"   element={<Login />} />
        <Route path="/signup"  element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/"        element={<Profile />} />
=======
        {/* Routes publiques — accessibles sans connexion */}
        <Route
          path='/login'
          element={<Login />}
        />
        <Route
          path='/signup'
          element={<Signup />}
        />

        {/* Routes protégées — redirige vers /login si pas connecté */}
        {/* On entoure chaque page sensible avec <ProtectedRoute> */}
        <Route
          path='/'
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

        {/* Route par défaut — si l'URL n'existe pas, on redirige vers / */}
        {/* Exemple : si quelqu'un tape /blabla → redirige vers Home */}
        <Route
          path='*'
          element={
            <Navigate
              to='/'
              replace
            />
          }
        />
>>>>>>> 9499846433640e4376a4a22cc88688fc14b540c7
      </Routes>
    </BrowserRouter>
  );
}
