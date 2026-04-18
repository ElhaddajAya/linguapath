import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Layout 2 colonnes sur grand écran, 1 colonne sur mobile
    <div className='min-h-screen bg-warm-50 flex'>
      {/* Colonne gauche — décorative, visible seulement sur lg+ */}
      <div
        className='hidden lg:flex lg:flex-1 bg-gradient-to-br from-orange-500 to-orange-600
                      items-center justify-center p-12'
      >
        <div className='text-white text-center'>
          <p
            className='text-4xl font-bold mb-4'
            style={{ fontFamily: "Georgia, serif" }}
          >
            Apprends en parlant.
          </p>
          <p className='text-orange-100 text-lg'>
            Des conversations réelles,
            <br />
            un niveau qui progresse.
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
            Bon retour 👋
          </h2>
          <p className='text-sm text-warm-500 mb-7'>
            Connecte-toi pour continuer ta progression
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
              <label className='text-sm font-medium text-warm-700'>Email</label>
              <input
                type='email'
                name='email'
                placeholder='aya@example.com'
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
                placeholder='••••••••'
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
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className='text-center mt-6 text-sm text-warm-500'>
            Pas encore de compte ?{" "}
            <Link
              to='/signup'
              className='font-semibold text-orange-600 hover:text-orange-700 transition-colors'
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
