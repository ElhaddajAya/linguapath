// pages/ForgotPassword.jsx
// L'utilisateur entre son email pour recevoir un lien de reset

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import api from "../services/api";
import { useLangue } from "../contexts/LangueContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  // t() = fonction de traduction du contexte LangueContext
  const { t } = useLangue();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError(t("auth.emptyEmail"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || t("auth.serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-warm-50 flex items-center justify-center px-4'>
      <div
        className='bg-white rounded-2xl border border-warm-200 shadow-soft
        p-10 w-full max-w-md'
      >
        <div className='flex justify-center mb-8'>
          <Logo size='small' />
        </div>

        {!sent ? (
          <>
            <h1 className='text-2xl font-bold text-warm-900 mb-2 text-center'>
              {t("auth.forgotTitle")}
            </h1>
            <p className='text-warm-500 text-sm text-center mb-8'>
              {t("auth.forgotSub")}
            </p>

            {error && (
              <div
                className='bg-red-50 border border-red-200 rounded-xl px-4 py-3
                text-red-600 text-sm mb-5'
              >
                {error}
              </div>
            )}

            <div className='flex flex-col gap-4'>
              <div>
                <label className='text-xs font-semibold text-warm-600 mb-1.5 block'>
                  {t("auth.emailAddress")}
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder='email@example.com'
                  className='w-full px-4 py-3 rounded-xl border border-warm-200
                    text-warm-900 text-sm bg-warm-50 focus:outline-none
                    focus:border-orange-300 placeholder:text-warm-300'
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className='w-full py-3 rounded-xl text-sm font-bold text-white
                  hover:opacity-90 transition-opacity
                  disabled:opacity-50 disabled:cursor-not-allowed'
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                }}
              >
                {loading ? t("auth.sendingLink") : t("auth.sendLink")}
              </button>
            </div>

            <p className='text-center text-warm-400 text-sm mt-6'>
              <Link
                to='/login'
                className='text-orange-500 hover:text-orange-700 font-medium'
              >
                ← {t("auth.backToLogin")}
              </Link>
            </p>
          </>
        ) : (
          <div className='text-center'>
            <div className='text-5xl mb-4'>📬</div>
            <h2 className='text-xl font-bold text-warm-900 mb-3'>
              {t("auth.emailSentTitle")}
            </h2>
            <p className='text-warm-500 text-sm mb-2'>
              {t("auth.emailSentBody")}
            </p>
            <p className='text-warm-400 text-xs mb-8'>
              {t("auth.emailSentSpam")}
            </p>
            <button
              onClick={() => navigate("/login")}
              className='px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                hover:opacity-90 transition-opacity'
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              }}
            >
              {t("auth.backToLogin")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
