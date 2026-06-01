// pages/VerifyEmail.jsx
// Page appelée quand l'utilisateur clique sur le lien dans son email

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../components/Logo";
import api from "../services/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Lien de vérification invalide.");
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        // Sauvegarder le token et user dans localStorage
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setStatus("success");
        setMessage(res.data.message);
        // Rediriger vers /home après 2 secondes
        setTimeout(() => navigate("/home"), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Lien invalide ou expiré."
        );
      });
  }, []);

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-warm-200 shadow-soft
        p-10 w-full max-w-md text-center">

        <div className="flex justify-center mb-6">
          <Logo size="small" />
        </div>

        {status === "loading" && (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-orange-200
              border-t-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-warm-600 font-medium">Vérification en cours...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center
              justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <h2 className="text-xl font-bold text-warm-900 mb-2">Email vérifié !</h2>
            <p className="text-warm-500 text-sm mb-6">{message}</p>
            <p className="text-warm-400 text-xs">Redirection automatique...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center
              justify-center mx-auto mb-4 text-3xl">
              ❌
            </div>
            <h2 className="text-xl font-bold text-warm-900 mb-2">Lien invalide</h2>
            <p className="text-warm-500 text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
            >
              Retour à la connexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}