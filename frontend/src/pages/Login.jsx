import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../services/api";
import Logo from "../components/Logo";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [error, setError]   = useState(
    searchParams.get("error") === "google_failed"
      ? "La connexion avec Google a échoué. Réessayez."
      : ""
  );
  const [loading, setLoading]   = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowResend(false);
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/home");
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur de connexion";
      setError(msg);
      if (err.response?.data?.emailNotVerified) setShowResend(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  const handleResend = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      setError("Email de vérification renvoyé ! Vérifiez votre boîte mail.");
      setShowResend(false);
    } catch {
      setError("Erreur lors de l'envoi.");
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 flex">
      {/* Colonne gauche décorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-orange-500 to-orange-600
        items-center justify-center p-12">
        <div className="text-white text-center">
          <p className="text-4xl font-bold mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Apprends en parlant.
          </p>
          <p className="text-orange-100 text-lg">
            Des conversations réelles,<br />un niveau qui progresse.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Logo size="small" />
          </div>

          <h2 className="text-2xl font-semibold text-warm-900 mb-1">Bon retour 👋</h2>
          <p className="text-sm text-warm-500 mb-7">Connecte-toi pour continuer ta progression</p>

          {/* Bouton Google */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl
              border border-warm-200 bg-white text-warm-700 text-sm font-medium
              hover:border-warm-300 hover:bg-warm-50 transition-colors mb-5 shadow-soft"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-warm-200" />
            <span className="text-xs text-warm-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-warm-200" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
              {showResend && (
                <button onClick={handleResend}
                  className="block mt-2 text-orange-600 underline text-xs font-medium">
                  Renvoyer l'email de vérification
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-warm-700">Email</label>
              <input type="email" name="email" placeholder="email@example.com"
                value={form.email} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white
                  text-warm-900 text-sm placeholder:text-warm-400 focus:outline-none
                  focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-warm-700">Mot de passe</label>
                <Link to="/forgot-password"
                  className="text-xs text-orange-500 hover:text-orange-700 font-medium transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <input type="password" name="password" placeholder="••••••••"
                value={form.password} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white
                  text-warm-900 text-sm placeholder:text-warm-400 focus:outline-none
                  focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm mt-2
                transition-opacity disabled:opacity-60 hover:opacity-90 active:opacity-80"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-warm-500">
            Pas encore de compte ?{" "}
            <Link to="/signup" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}