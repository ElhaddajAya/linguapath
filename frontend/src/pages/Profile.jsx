// Profile.jsx — consultation + modification du profil (US-03)
// Modification : nom complet, avatar, mot de passe

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";
import {
  ArrowLeft,
  Settings,
  Pencil,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../services/api";

const NIVEAU_STYLE = {
  A1: "bg-gray-100 text-gray-500",
  A2: "bg-blue-50 text-blue-500",
  B1: "bg-green-50 text-green-600",
  B2: "bg-yellow-50 text-yellow-600",
  C1: "bg-orange-50 text-orange-600",
  C2: "bg-red-50 text-red-600",
};

const LANGUE_EMOJI = {
  Anglais: "🇬🇧",
  Espagnol: "🇪🇸",
  Français: "🇫🇷",
  Allemand: "🇩🇪",
  Coréen: "🇰🇷",
  Japonais: "🇯🇵",
  Chinois: "🇨🇳",
  Arabe: "🇸🇦",
};

const AVATARS = [
  "🦊",
  "🐼",
  "🐨",
  "🦁",
  "🐯",
  "🦋",
  "🐬",
  "🦅",
  "🌸",
  "⭐",
  "🎯",
  "🚀",
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  // ── Mode édition ───────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [nomEdit, setNomEdit] = useState(user.nom || "");
  const [avatarEdit, setAvatarEdit] = useState(user.avatar || "");

  // Mot de passe
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changePwd, setChangePwd] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const ouvrirEdition = () => {
    setNomEdit(user.nom || "");
    setAvatarEdit(user.avatar || "");
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setChangePwd(false);
    setEditing(true);
  };

  const annuler = () => {
    setEditing(false);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setChangePwd(false);
  };

  const sauvegarder = async () => {
    if (!nomEdit.trim()) {
      showToast("Le nom ne peut pas être vide.", "error");
      return;
    }
    if (changePwd) {
      if (!currentPwd) {
        showToast("Entrez votre mot de passe actuel.", "error");
        return;
      }
      if (newPwd.length < 6) {
        showToast(
          "Le nouveau mot de passe doit contenir au moins 6 caractères.",
          "error",
        );
        return;
      }
      if (newPwd !== confirmPwd) {
        showToast("Les mots de passe ne correspondent pas.", "error");
        return;
      }
    }

    setSaving(true);
    try {
      const body = { nom: nomEdit.trim(), avatar: avatarEdit };
      if (changePwd) {
        body.currentPassword = currentPwd;
        body.newPassword = newPwd;
      }

      const res = await api.put("/users/me", body);
      const updatedUser = {
        ...user,
        nom: res.data.user.nom,
        avatar: res.data.user.avatar ?? "",
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event("userUpdated"));
      setEditing(false);
      setChangePwd(false);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      showToast("Profil mis à jour avec succès.");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Erreur lors de la sauvegarde.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderAvatar = (avatarValue, size = "lg") => {
    const dim = size === "lg" ? "w-20 h-20" : "w-10 h-10";
    const textSize = size === "lg" ? "text-2xl" : "text-sm";
    const isImage =
      typeof avatarValue === "string" &&
      /^(https?:\/\/|data:image\/)/.test(avatarValue);

    if (isImage) {
      return (
        <img
          src={avatarValue}
          alt={user.nom}
          className={`${dim} rounded-full object-cover border-2 border-warm-200`}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      );
    }

    if (avatarValue) {
      return (
        <div
          className={`${dim} rounded-full flex items-center justify-center bg-warm-100 border-2 border-warm-200 text-4xl`}
        >
          {avatarValue}
        </div>
      );
    }

    return (
      <div
        className={`${dim} rounded-full flex items-center justify-center text-white font-bold`}
        style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
      >
        <span className={textSize}>
          {user.nom?.charAt(0).toUpperCase() || "?"}
        </span>
      </div>
    );
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm text-warm-900 bg-warm-50 focus:outline-none focus:border-orange-300 placeholder:text-warm-300";

  return (
    <div className='min-h-screen bg-warm-50'>
      <Navbar />

      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
          ${toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
        >
          {toast.type === "success" ? "✓ " : "✕ "}
          {toast.msg}
        </div>
      )}

      <div className='max-w-7xl mx-auto px-4 sm:px-10 py-8 sm:py-10'>
        <h1 className='text-2xl font-semibold text-warm-900 mb-8'>
          Mon profil
        </h1>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* ── Colonne gauche ── */}
          <div className='lg:col-span-1 flex flex-col gap-4'>
            {/* Card avatar + nom */}
            <div className='bg-white rounded-2xl border border-warm-200 shadow-soft p-6'>
              <div className='flex flex-col items-center text-center gap-3 pb-6 border-b border-warm-200'>
                {renderAvatar(editing ? avatarEdit : user.avatar, "lg")}

                {editing ? (
                  <input
                    type='text'
                    value={nomEdit}
                    onChange={(e) => setNomEdit(e.target.value)}
                    className='text-center w-full px-3 py-2 rounded-xl border border-warm-200
                      text-warm-900 font-semibold text-lg focus:outline-none focus:border-orange-300 bg-warm-50'
                    placeholder='Votre nom complet'
                    autoFocus
                  />
                ) : (
                  <div>
                    <h2 className='font-semibold text-warm-900 text-lg'>
                      {user.nom}
                    </h2>
                    <p className='text-sm text-warm-500'>{user.email}</p>
                    <span className='inline-block mt-2 text-xs px-3 py-0.5 rounded-full bg-warm-100 text-warm-500 capitalize'>
                      {user.role || "user"}
                    </span>
                  </div>
                )}
              </div>

              {/* Sélecteur avatar */}
              {editing && (
                <div className='py-4 border-b border-warm-200'>
                  <p className='text-xs font-semibold text-warm-400 uppercase tracking-widest mb-3'>
                    Choisir un avatar
                  </p>
                  <div className='grid grid-cols-6 gap-2'>
                    <button
                      onClick={() => setAvatarEdit("")}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all
                        ${avatarEdit === "" ? "ring-2 ring-orange-400 ring-offset-1" : "opacity-60 hover:opacity-100"}`}
                      style={{
                        background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                      }}
                    >
                      {user.nom?.charAt(0).toUpperCase() || "?"}
                    </button>
                    {AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setAvatarEdit(emoji)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xl bg-warm-100 transition-all
                          ${avatarEdit === emoji ? "ring-2 ring-orange-400 ring-offset-1 bg-orange-50" : "hover:bg-warm-200"}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className='pt-5 flex flex-col gap-3'>
                {editing ? (
                  <>
                    <button
                      onClick={sauvegarder}
                      disabled={saving}
                      className='w-full py-2.5 rounded-xl text-sm font-semibold text-white
                        hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2'
                      style={{
                        background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                      }}
                    >
                      <Check size={15} />
                      {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                    <button
                      onClick={annuler}
                      className='w-full py-2.5 rounded-xl text-sm font-medium text-warm-600
                        border border-warm-200 hover:bg-warm-100 transition-colors flex items-center justify-center gap-2'
                    >
                      <X size={14} /> Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={ouvrirEdition}
                      className='w-full py-2.5 rounded-xl text-sm font-semibold text-white
                        hover:opacity-90 transition-opacity flex items-center justify-center gap-2'
                      style={{
                        background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                      }}
                    >
                      <Pencil size={14} /> Modifier le profil
                    </button>
                    <button
                      onClick={() => navigate("/")}
                      className='w-full py-2.5 rounded-xl text-sm font-medium text-warm-600
                        border border-warm-200 hover:bg-warm-100 transition-colors flex items-center justify-center gap-1.5'
                    >
                      <ArrowLeft size={14} /> Retour à l'accueil
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Card mot de passe — visible en mode édition uniquement */}
            {editing && (
              <div className='bg-white rounded-2xl border border-warm-200 shadow-soft p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <p className='text-xs font-semibold text-warm-400 uppercase tracking-widest'>
                    Mot de passe
                  </p>
                  <button
                    onClick={() => {
                      setChangePwd(!changePwd);
                      setCurrentPwd("");
                      setNewPwd("");
                      setConfirmPwd("");
                    }}
                    className='text-xs text-orange-500 hover:text-orange-700 font-medium transition-colors'
                  >
                    {changePwd ? "Annuler" : "Changer"}
                  </button>
                </div>

                {changePwd ? (
                  <div className='flex flex-col gap-3'>
                    {/* Mot de passe actuel */}
                    <div>
                      <label className='text-xs font-medium text-warm-600 mb-1 block'>
                        Mot de passe actuel
                      </label>
                      <div className='relative'>
                        <input
                          type={showCurrent ? "text" : "password"}
                          value={currentPwd}
                          onChange={(e) => setCurrentPwd(e.target.value)}
                          placeholder='••••••••'
                          className={inputCls + " pr-10"}
                        />
                        <button
                          type='button'
                          onClick={() => setShowCurrent(!showCurrent)}
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600'
                        >
                          {showCurrent ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                    {/* Nouveau mot de passe */}
                    <div>
                      <label className='text-xs font-medium text-warm-600 mb-1 block'>
                        Nouveau mot de passe
                      </label>
                      <div className='relative'>
                        <input
                          type={showNew ? "text" : "password"}
                          value={newPwd}
                          onChange={(e) => setNewPwd(e.target.value)}
                          placeholder='Min. 6 caractères'
                          className={inputCls + " pr-10"}
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
                    {/* Confirmer */}
                    <div>
                      <label className='text-xs font-medium text-warm-600 mb-1 block'>
                        Confirmer le mot de passe
                      </label>
                      <div className='relative'>
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPwd}
                          onChange={(e) => setConfirmPwd(e.target.value)}
                          placeholder='Répéter le mot de passe'
                          className={inputCls + " pr-10"}
                        />
                        <button
                          type='button'
                          onClick={() => setShowConfirm(!showConfirm)}
                          className='absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600'
                        >
                          {showConfirm ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                      {/* Indicateur match */}
                      {confirmPwd && (
                        <p
                          className={`text-xs mt-1 ${newPwd === confirmPwd ? "text-green-600" : "text-red-500"}`}
                        >
                          {newPwd === confirmPwd
                            ? "✓ Les mots de passe correspondent"
                            : "✕ Ne correspondent pas"}
                        </p>
                      )}
                    </div>

                    {/* Bouton Changer le mot de passe */}
                    <button
                      onClick={sauvegarder}
                      disabled={
                        saving ||
                        !currentPwd ||
                        !newPwd ||
                        !confirmPwd ||
                        newPwd !== confirmPwd
                      }
                      className='w-full py-2.5 rounded-xl text-sm font-semibold text-white
                        hover:opacity-90 transition-opacity mt-1
                        disabled:opacity-40 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2'
                      style={{
                        background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                      }}
                    >
                      <Check size={14} />
                      {saving ? "Sauvegarde..." : "Changer le mot de passe"}
                    </button>
                  </div>
                ) : (
                  <p className='text-sm text-warm-400 italic'>
                    Cliquez sur "Changer" pour modifier votre mot de passe.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Colonne droite ── */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-2xl border border-warm-200 shadow-soft p-6'>
              {user.role === "admin" ? (
                <div className='text-center py-12'>
                  <div className='flex justify-center mb-4'>
                    <Settings
                      size={48}
                      className='text-warm-300'
                    />
                  </div>
                  <p className='font-semibold text-warm-900 mb-2'>
                    Espace administrateur
                  </p>
                  <p className='text-warm-500 text-sm mb-6'>
                    Gérez les utilisateurs et les scénarios depuis le panneau
                    admin.
                  </p>
                  <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                    <button
                      onClick={() => navigate("/admin/users")}
                      className='px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity'
                      style={{
                        background: "linear-gradient(135deg, #F59E0B, #EA580C)",
                      }}
                    >
                      Gérer les utilisateurs
                    </button>
                    <button
                      onClick={() => navigate("/admin/scenarios")}
                      className='px-6 py-2.5 rounded-xl text-sm font-semibold text-warm-700 border border-warm-200 hover:bg-warm-50 transition-colors'
                    >
                      Gérer les scénarios
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className='text-xs font-semibold text-warm-400 uppercase tracking-widest mb-5'>
                    Langues en apprentissage
                  </p>
                  {user.langues?.length > 0 ? (
                    <div className='flex flex-col gap-3'>
                      {user.langues.map((l) => (
                        <div
                          key={l.langue}
                          className='flex items-center justify-between px-5 py-4 rounded-xl border border-warm-200 bg-warm-50 hover:border-orange-200 transition-colors'
                        >
                          <div className='flex items-center gap-3'>
                            <span className='text-xl'>
                              {LANGUE_EMOJI[l.langue] || "🌍"}
                            </span>
                            <span className='font-medium text-warm-900'>
                              {l.langue}
                            </span>
                          </div>
                          <div className='flex items-center gap-3'>
                            <span
                              className={`text-xs font-semibold px-3 py-1.5 rounded-full ${NIVEAU_STYLE[l.niveau]}`}
                            >
                              {l.niveau}
                            </span>
                            <button
                              onClick={() =>
                                navigate(`/scenarios?langue=${l.langue}`)
                              }
                              className='text-xs px-3 py-1.5 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity'
                              style={{
                                background:
                                  "linear-gradient(135deg, #F59E0B, #EA580C)",
                              }}
                            >
                              Pratiquer →
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => navigate("/quiz")}
                        className='w-full py-3.5 rounded-xl border-2 border-dashed border-warm-300
                          text-warm-500 text-sm font-medium hover:border-orange-300 hover:text-orange-500
                          transition-colors flex items-center justify-center gap-2 mt-2'
                      >
                        <span className='text-lg'>+</span> Ajouter une nouvelle
                        langue
                      </button>
                    </div>
                  ) : (
                    <div className='text-center py-12'>
                      <p className='text-5xl mb-4'>🌍</p>
                      <p className='text-warm-500 text-sm mb-5'>
                        Aucune langue en apprentissage pour l'instant.
                      </p>
                      <button
                        onClick={() => navigate("/quiz")}
                        className='px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity'
                        style={{
                          background:
                            "linear-gradient(135deg, #F59E0B, #EA580C)",
                        }}
                      >
                        Choisir une langue
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
