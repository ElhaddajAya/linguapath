import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login   from './pages/Login'
import Signup  from './pages/Signup'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"   element={<Login />} />
        <Route path="/signup"  element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/"        element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}