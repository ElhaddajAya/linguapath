// pages/GoogleSuccess.jsx
// Page intermédiaire après connexion Google
// Récupère le token et user depuis l'URL et redirige vers /home

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const userRaw = searchParams.get("user");

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        // Si pas encore de langue → quiz, sinon → home
        navigate(user.langues?.length > 0 ? "/home" : "/quiz", { replace: true });
      } catch {
        navigate("/login?error=google_failed", { replace: true });
      }
    } else {
      navigate("/login?error=google_failed", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-orange-200
          border-t-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-warm-600 font-medium text-sm">Connexion Google en cours...</p>
      </div>
    </div>
  );
}