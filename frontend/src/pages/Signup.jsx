import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";
import Logo from "../components/Logo";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await register(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      // Après inscription → on envoie directement au test de niveau
      navigate("/quiz");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-surface-50 flex items-center justify-center py-8'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-sm border border-surface-200 p-8'>
        {/* Logo */}
        <div className='flex flex-col items-center mb-8'>
          <Logo size='full' />
          <p className='text-surface-500 text-sm mt-3'>
            Rejoins LinguaPath et commence à apprendre
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4'>
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-5'
        >
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-surface-700'>
              Nom complet
            </label>
            <input
              type='text'
              name='nom'
              placeholder='John Doe'
              className='w-full px-4 py-2.5 rounded-lg border border-surface-200 text-surface-900
                         focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                         transition-all text-sm'
              value={form.nom}
              onChange={handleChange}
              required
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-surface-700'>
              Email
            </label>
            <input
              type='email'
              name='email'
              placeholder='john.doe@example.com'
              className='w-full px-4 py-2.5 rounded-lg border border-surface-200 text-surface-900
                         focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                         transition-all text-sm'
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-medium text-surface-700'>
              Mot de passe
            </label>
            <input
              type='password'
              name='password'
              placeholder='Minimum 6 caractères'
              className='w-full px-4 py-2.5 rounded-lg border border-surface-200 text-surface-900
                         focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                         transition-all text-sm'
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full py-2.5 rounded-lg font-semibold text-white text-sm mt-1
                       transition-opacity disabled:opacity-60'
            style={{
              background: "linear-gradient(to right, #F59E0B, #EA580C)",
            }}
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className='text-center mt-6 text-sm text-surface-500'>
          Déjà un compte ?{" "}
          <Link
            to='/login'
            className='text-primary-600 font-medium hover:underline'
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
