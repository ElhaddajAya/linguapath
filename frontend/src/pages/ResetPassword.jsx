// pages/ResetPassword.jsx
// L'utilisateur entre son nouveau mot de passe après avoir cliqué sur le lien

import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Logo from "../components/Logo";
import { Eye, EyeOff } from "lucide-react";
import api from "../services/api";
import { useLangue } from "../contexts/LangueContext";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  // t() = fonction de traduction du contexte LangueContext
  const { t } = useLangue();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      setError(t("auth.fillAllFields"));
      return;
    }
    if (newPassword.length < 6) {
      setError(t("profile.errorPwdLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("profile.errorPwdMatch"));
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t("auth.invalidExpiredLink"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-warm-200 text-warm-900 text-sm bg-warm-50 focus:outline-none focus:border-orange-300 pr-10";

  if (!token) {
    return (
      <div className='min-h-screen bg-warm-50 flex items-center justify-center px-4'>
        <div className='bg-white rounded-2xl border border-warm-200 shadow-soft p-10 w-full max-w-md text-center'>
          <div className='text-5xl mb-4'>❌</div>
          <h2 className='text-xl font-bold text-warm-900 mb-3'>
            {t("auth.invalidLink")}
          </h2>
          <p className='text-warm-500 text-sm mb-6'>
            {t("auth.invalidLinkSub")}
          </p>
          <Link
            to='/forgot-password'
            className='text-orange-500 hover:text-orange-700 font-medium text-sm'
          >
            {t("auth.requestNewLink")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-warm-50 flex items-center justify-center px-4'>
      <div className='bg-white rounded-2xl border border-warm-200 shadow-soft p-10 w-full max-w-md'>
        <div className='flex justify-center mb-8'>
          <Logo size='small' />
        </div>

        {!success ? (
          <>
            <h1 className='text-2xl font-bold text-warm-900 mb-2 text-center'>
              {t("auth.newPasswordTitle")}
            </h1>
            <p className='text-warm-500 text-sm text-center mb-8'>
              {t("auth.newPasswordSub")}
            </p>

            {error && (
              <div className='bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm mb-5'>
                {error}
              </div>
            )}

            <div className='flex flex-col gap-4'>
              <div>
                <label className='text-xs font-semibold text-warm-600 mb-1.5 block'>
                  {t("profile.newPwd")}
                </label>
                <div className='relative'>
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder='Min. 6 caractères'
                    className={inputCls}
                  />
                  <button
                    type='button'
                    onClick={() => setShowNew(!showNew)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600'
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className='text-xs font-semibold text-warm-600 mb-1.5 block'>
                  {t("profile.confirmPwd")}
                </label>
                <div className='relative'>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Répéter le mot de passe'
                    className={inputCls}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirm(!showConfirm)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600'
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword && (
                  <p
                    className={`text-xs mt-1 ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}
                  >
                    {newPassword === confirmPassword
                      ? t("profile.pwdMatch")
                      : t("profile.pwdNoMatch")}
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className='w-full py-3 rounded-xl text-sm font-bold text-white
                  hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2'
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                }}
              >
                {loading ? t("auth.resetting") : t("auth.resetPasswordBtn")}
              </button>
            </div>
          </>
        ) : (
          <div className='text-center'>
            <div className='text-5xl mb-4'>✅</div>
            <h2 className='text-xl font-bold text-warm-900 mb-3'>
              {t("auth.passwordChanged")}
            </h2>
            <p className='text-warm-500 text-sm mb-2'>
              {t("auth.passwordChangedSub")}
            </p>
            <p className='text-warm-400 text-xs mb-6'>
              {t("auth.autoRedirect")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
