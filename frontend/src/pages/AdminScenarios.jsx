// pages/AdminScenarios.jsx
// Page admin : création, modification et suppression des scénarios.
// Accessible uniquement via AdminRoute (role === 'admin').

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/NavBar";
import {
  Check, X, Plus, Pencil, Trash2, Sparkles,
  ArrowLeft, Users, Globe, Search, Clapperboard, Loader2,
} from "lucide-react";
import api from "../services/api";

const NIVEAUX = ["A1", "A2", "B1", "B2", "C1", "C2"];
const LANGUES  = ["Anglais", "Espagnol", "Français", "Allemand", "Coréen", "Japonais", "Chinois", "Arabe"];
const THEMES   = ["Restaurant", "Voyage", "Entretien", "Ville", "Médecin", "Shopping", "Famille", "Travail", "Général"];

const NIVEAU_COLORS = {
  A1: "bg-slate-100 text-slate-500",
  A2: "bg-blue-50 text-blue-500",
  B1: "bg-green-50 text-green-600",
  B2: "bg-yellow-50 text-yellow-600",
  C1: "bg-orange-50 text-orange-600",
  C2: "bg-red-50 text-red-600",
};

const FORM_VIDE = {
  title: "", theme: "", description: "",
  langue: "", minLevel: "A1", maxLevel: "B2", emoji: "💬",
  systemPrompt: "",
};

export default function AdminScenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);

  // ── Modal (création + édition) ─────────────────────────────
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(FORM_VIDE);
  const [saving, setSaving]         = useState(false);

  // ── Filtres ────────────────────────────────────────────────
  const [search,       setSearch]       = useState("");
  const [filtreLangue, setFiltreLangue] = useState("");

  // ── Suppression ────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => { chargerScenarios(); }, []);

  const chargerScenarios = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/scenarios");
      setScenarios(res.data.scenarios);
    } catch {
      showToast("Erreur lors du chargement des scénarios.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const ouvrirCreation = () => {
    setEditTarget(null);
    setForm(FORM_VIDE);
    setShowModal(true);
  };

  const ouvrirEdition = (scenario) => {
    setEditTarget(scenario);
    setForm({
      title:        scenario.titre || "",
      theme:        scenario.theme || "",
      description:  scenario.description || "",
      langue:       scenario.langue || "",
      minLevel:     scenario.niveauMin || "A1",
      maxLevel:     scenario.niveauMax || "B2",
      emoji:        scenario.emoji || "💬",
      systemPrompt: scenario.systemPrompt || "",
    });
    setShowModal(true);
  };

  const fermerModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setForm(FORM_VIDE);
  };

  const sauvegarder = async () => {
    if (!form.title || !form.theme || !form.description || !form.langue || !form.systemPrompt) {
      showToast("Remplis tous les champs obligatoires.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.put(`/admin/scenarios/${editTarget._id}`, form);
        setScenarios((prev) =>
          prev.map((s) => (s._id === editTarget._id ? res.data.scenario : s))
        );
        showToast("Scénario modifié avec succès.");
      } else {
        const res = await api.post("/admin/scenarios", form);
        setScenarios((prev) => [res.data.scenario, ...prev]);
        showToast("Scénario créé avec succès.");
      }
      fermerModal();
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la sauvegarde.", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmerSuppression = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/scenarios/${confirmDelete}`);
      setScenarios((prev) => prev.filter((s) => s._id !== confirmDelete));
      showToast("Scénario supprimé.");
    } catch {
      showToast("Erreur lors de la suppression.", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const filtres = scenarios.filter((sc) => {
    const matchRecherche = !search || sc.titre?.toLowerCase().includes(search.toLowerCase());
    const matchLangue    = !filtreLangue || sc.langue === filtreLangue;
    return matchRecherche && matchLangue;
  });

  return (
    <div className="min-h-screen bg-warm-50">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 sm:right-6 z-50 px-4 py-3 rounded-xl shadow-lg
            text-sm font-medium flex items-center gap-2
            ${toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {toast.type === "success" ? <Check size={14} /> : <X size={14} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-5 sm:py-10">

        {/* ── Header ── */}
        <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8 flex-wrap gap-4">
          <div>
            {/* Breadcrumb retour */}
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 text-xs text-warm-400
                hover:text-orange-500 transition-colors mb-3 group"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Utilisateurs</span>
              <Users size={11} className="ml-0.5" />
            </Link>

            <h1 className="text-xl sm:text-2xl font-semibold text-warm-900 flex items-center gap-2">
              <Clapperboard size={20} className="text-orange-500" />
              Gestion des scénarios
            </h1>
            <p className="text-warm-500 text-xs sm:text-sm mt-1">
              {scenarios.length} scénario{scenarios.length !== 1 ? "s" : ""} disponible{scenarios.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={ouvrirCreation}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl
              text-sm font-semibold text-white hover:opacity-90
              transition-opacity shadow-soft"
            style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Nouveau scénario</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>

        {/* ── Filtres ── */}
        {!loading && scenarios.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par titre..."
                className="pl-9 pr-4 py-2.5 rounded-xl border border-warm-200 text-sm
                  text-warm-900 bg-white focus:outline-none focus:border-orange-300
                  w-full placeholder:text-warm-300"
              />
            </div>
            <select
              value={filtreLangue}
              onChange={(e) => setFiltreLangue(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-warm-200 text-sm
                text-warm-700 bg-white focus:outline-none focus:border-orange-300
                sm:w-44"
            >
              <option value="">Toutes les langues</option>
              {LANGUES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )}

        {/* ── Liste scénarios ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-warm-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Chargement...</span>
          </div>
        ) : scenarios.length === 0 ? (
          <div className="bg-white rounded-2xl border border-warm-200 shadow-soft p-10 sm:p-12 text-center">
            <Clapperboard size={44} className="text-warm-300 mx-auto mb-4" />
            <p className="text-warm-600 font-medium mb-2">Aucun scénario pour l'instant</p>
            <p className="text-warm-400 text-sm mb-5">
              Crée le premier scénario pour que les apprenants puissent pratiquer.
            </p>
            <button
              onClick={ouvrirCreation}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
                text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
            >
              <Plus size={15} /> Créer le premier scénario
            </button>
          </div>
        ) : filtres.length === 0 ? (
          <div className="bg-white rounded-2xl border border-warm-200 shadow-soft p-10 text-center">
            <Search size={36} className="text-warm-300 mx-auto mb-3" />
            <p className="text-warm-600 font-medium">Aucun scénario ne correspond aux filtres</p>
            <button
              onClick={() => { setSearch(""); setFiltreLangue(""); }}
              className="mt-3 text-sm text-orange-500 hover:text-orange-700 transition-colors font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filtres.map((sc) => (
              <div
                key={sc._id}
                className="bg-white rounded-2xl border border-warm-200 shadow-soft
                  p-4 sm:p-5 flex flex-col gap-3 hover:border-orange-200 transition-colors"
              >
                {/* Emoji + titre */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl sm:text-3xl">{sc.emoji || "💬"}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-warm-900 text-sm sm:text-base leading-tight">
                      {sc.titre}
                    </p>
                    <p className="text-xs text-warm-400 mt-0.5">{sc.theme}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-warm-500 leading-relaxed line-clamp-2">
                  {sc.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full
                    bg-orange-50 text-orange-600 border border-orange-100 font-medium">
                    <Globe size={10} /> {sc.langue}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${NIVEAU_COLORS[sc.niveauMin]}`}>
                    {sc.niveauMin}
                  </span>
                  <span className="text-xs text-warm-400 self-center">→</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${NIVEAU_COLORS[sc.niveauMax]}`}>
                    {sc.niveauMax}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-warm-100">
                  <button
                    onClick={() => ouvrirEdition(sc)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs
                      px-3 py-2 rounded-xl border border-warm-200
                      text-warm-600 hover:border-orange-300 hover:text-orange-600
                      transition-colors font-medium"
                  >
                    <Pencil size={12} /> Modifier
                  </button>
                  <button
                    onClick={() => setConfirmDelete(sc._id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs
                      px-3 py-2 rounded-xl border border-warm-200
                      text-warm-400 hover:border-red-200 hover:text-red-500
                      transition-colors font-medium"
                  >
                    <Trash2 size={12} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Création / Édition ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm
            flex items-center justify-center z-50 px-4"
          onClick={fermerModal}
        >
          <div
            className="bg-white rounded-2xl border border-warm-200
              shadow-lg w-full max-w-lg p-5 sm:p-6 flex flex-col gap-4 sm:gap-5
              max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-warm-900 text-base sm:text-lg flex items-center gap-1.5">
                {editTarget
                  ? <><Pencil size={15} className="text-orange-500" /> Modifier le scénario</>
                  : <><Sparkles size={15} className="text-orange-500" /> Nouveau scénario</>}
              </h2>
              <button
                onClick={fermerModal}
                className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Emoji + Titre */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 w-20">
                <label className="text-xs font-medium text-warm-600">Emoji</label>
                <input
                  type="text"
                  value={form.emoji}
                  onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                  maxLength={2}
                  className="px-3 py-2.5 rounded-xl border border-warm-200 text-sm text-center
                    bg-warm-50 focus:outline-none focus:border-orange-300"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-medium text-warm-600">Titre *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Au restaurant"
                  className="px-4 py-2.5 rounded-xl border border-warm-200 text-sm text-warm-900
                    bg-warm-50 focus:outline-none focus:border-orange-300 placeholder:text-warm-300"
                />
              </div>
            </div>

            {/* Langue + Thème */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-medium text-warm-600">Langue *</label>
                <select
                  value={form.langue}
                  onChange={(e) => setForm((f) => ({ ...f, langue: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border border-warm-200 text-sm text-warm-700
                    bg-warm-50 focus:outline-none focus:border-orange-300"
                >
                  <option value="">Choisir</option>
                  {LANGUES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-medium text-warm-600">Thème *</label>
                <select
                  value={form.theme}
                  onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border border-warm-200 text-sm text-warm-700
                    bg-warm-50 focus:outline-none focus:border-orange-300"
                >
                  <option value="">Choisir</option>
                  {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Niveaux min / max */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-medium text-warm-600">Niveau min *</label>
                <select
                  value={form.minLevel}
                  onChange={(e) => setForm((f) => ({ ...f, minLevel: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border border-warm-200 text-sm text-warm-700
                    bg-warm-50 focus:outline-none focus:border-orange-300"
                >
                  {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-medium text-warm-600">Niveau max *</label>
                <select
                  value={form.maxLevel}
                  onChange={(e) => setForm((f) => ({ ...f, maxLevel: e.target.value }))}
                  className="px-3 py-2.5 rounded-xl border border-warm-200 text-sm text-warm-700
                    bg-warm-50 focus:outline-none focus:border-orange-300"
                >
                  {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-warm-600">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Décris brièvement le scénario et son contexte..."
                rows={3}
                className="px-4 py-2.5 rounded-xl border border-warm-200 text-sm text-warm-900
                  bg-warm-50 focus:outline-none focus:border-orange-300 placeholder:text-warm-300
                  resize-none"
              />
            </div>

            {/* System Prompt */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-warm-600">
                Rôle de l'IA (System Prompt) *
              </label>
              <textarea
                value={form.systemPrompt}
                onChange={(e) => setForm((f) => ({ ...f, systemPrompt: e.target.value }))}
                placeholder="Ex: Tu es Carlos, serveur dans un restaurant à Madrid. Tu parles uniquement espagnol..."
                rows={4}
                className="px-4 py-2.5 rounded-xl border border-warm-200 text-sm text-warm-900
                  bg-warm-50 focus:outline-none focus:border-orange-300 placeholder:text-warm-300
                  resize-none"
              />
              <p className="text-xs text-warm-400">
                Décrit le personnage que jouera l'IA pendant la conversation.
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={fermerModal}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-warm-200
                  text-warm-600 hover:border-warm-300 hover:bg-warm-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={sauvegarder}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5
                  rounded-xl text-sm font-semibold text-white
                  disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
              >
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Sauvegarde...</>
                  : editTarget ? "Modifier" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmation suppression ── */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm
            flex items-center justify-center z-50 px-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-white rounded-2xl border border-warm-200
              shadow-lg w-full max-w-sm p-6 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100
                flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-warm-900 text-lg mb-2">
                Supprimer ce scénario ?
              </h3>
              <p className="text-sm text-warm-500 leading-relaxed">
                Cette action est irréversible. Les conversations existantes liées à ce scénario ne seront pas supprimées.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-warm-200
                  text-warm-600 hover:border-warm-300 hover:bg-warm-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmerSuppression}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5
                  rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting
                  ? <><Loader2 size={14} className="animate-spin" /> Suppression...</>
                  : <><Trash2 size={14} /> Supprimer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
