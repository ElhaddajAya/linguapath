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
      navigate("/quiz");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-warm-50 flex'>
      {/* Colonne gauche — décorative lg+ */}
      <div
        className='hidden lg:flex lg:flex-1 bg-gradient-to-br from-orange-500 to-orange-600
                      items-center justify-center p-12'
      >
        <div className='text-white text-center'>
          <p
            className='text-4xl font-bold mb-4'
            style={{ fontFamily: "Georgia, serif" }}
          >
            Rejoins LinguaPath.
          </p>
          <p className='text-orange-100 text-lg'>
            Choisis ta langue,
            <br />
            découvre ton niveau.
          </p>
        </div>
      </div>

      {/* Colonne droite — formulaire */}
      <div className='flex-1 flex items-center justify-center px-6 py-10'>
        <div className='w-full max-w-md'>
          {/* Logo — taille réduite */}
          <div className='flex justify-center mb-8'>
            <Logo size='small' />
          </div>

          <h2 className='text-2xl font-semibold text-warm-900 mb-1'>
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
                           bg-white text-warm-900 text-sm placeholder:text-warm-400
                           focus:outline-none focus:border-orange-500
                           focus:ring-2 focus:ring-orange-500/10 transition-all'
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-sm font-medium text-warm-700'>Email</label>
              <input
                type='email'
                name='email'
                placeholder='email@example.com'
                value={form.email}
                onChange={handleChange}
                required
                className='w-full px-4 py-3 rounded-xl border border-warm-200
                           bg-white text-warm-900 text-sm placeholder:text-warm-400
                           focus:outline-none focus:border-orange-500
                           focus:ring-2 focus:ring-orange-500/10 transition-all'
              />
            </div>

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
                           bg-white text-warm-900 text-sm placeholder:text-warm-400
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
