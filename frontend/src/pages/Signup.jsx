// Signup.jsx — minimal : nom + email + password uniquement

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";
import Logo from "../components/Logo";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await register(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      // Après inscription → test de niveau
      navigate("/quiz");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-warm-50 flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-sm'>
        {/* Logo */}
        <div className='flex justify-center mb-10'>
          <Logo size='full' />
        </div>

        {/* Card */}
        <div className='bg-white rounded-3xl shadow-card border border-warm-200 p-8'>
          <h2 className='text-xl font-semibold text-warm-900 mb-1'>
            Crée ton compte
          </h2>
          <p className='text-sm text-warm-500 mb-7'>
            Rejoins LinguaPath et commence à apprendre
          </p>

          {error && (
            <div
              className='bg-red-50 border border-red-200 text-red-600
                            text-sm rounded-xl px-4 py-3 mb-5'
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className='flex flex-col gap-4'
          >
            {/* Nom */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-warm-700'>
                Nom complet
              </label>
              <input
                type='text'
                name='nom'
                placeholder='Aya El Haddaj'
                value={form.nom}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 rounded-xl border border-warm-200
                           bg-warm-50 text-warm-900 text-sm placeholder:text-warm-400
                           focus:outline-none focus:border-orange-500
                           focus:ring-2 focus:ring-orange-500/10 transition-all'
              />
            </div>

            {/* Email */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-warm-700'>Email</label>
              <input
                type='email'
                name='email'
                placeholder='aya@example.com'
                value={form.email}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 rounded-xl border border-warm-200
                           bg-warm-50 text-warm-900 text-sm placeholder:text-warm-400
                           focus:outline-none focus:border-orange-500
                           focus:ring-2 focus:ring-orange-500/10 transition-all'
              />
            </div>

            {/* Password */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-warm-700'>
                Mot de passe
              </label>
              <input
                type='password'
                name='password'
                placeholder='Minimum 6 caractères'
                value={form.password}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 rounded-xl border border-warm-200
                           bg-warm-50 text-warm-900 text-sm placeholder:text-warm-400
                           focus:outline-none focus:border-orange-500
                           focus:ring-2 focus:ring-orange-500/10 transition-all'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 rounded-xl font-semibold text-white text-sm
                         mt-2 transition-opacity disabled:opacity-60
                         hover:opacity-90 active:opacity-80'
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              }}
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className='text-center mt-6 text-sm text-warm-500'>
            Déjà un compte ?{" "}
            <Link
              to='/login'
              className='font-semibold text-orange-600 hover:text-orange-700 transition-colors'
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
