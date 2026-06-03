import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  EyeOff,
  Languages,
  Mic,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";

// ──────────────────────────────────────
// Logo LinguaPath — avatar de l'IA
// ──────────────────────────────────────
function LinguaPathAvatar() {
  return (
    <div
      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-orange-200"
      style={{
        background: "#FFFFFF",
        boxShadow: "0 2px 8px rgba(234,88,12,0.15)",
      }}
    >
      {/* Logo A語 — fond blanc, logo orange */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bulle de chat orange */}
        <path
          d="M4 6C4 4.34 5.34 3 7 3H25C26.66 3 28 4.34 28 6V20C28 21.66 26.66 23 25 23H10L5 28V23H7C5.34 23 4 21.66 4 20V6Z"
          fill="url(#logoGrad)"
        />
        {/* Lettre A blanche */}
        <text
          x="7"
          y="18"
          fontFamily="serif"
          fontSize="11"
          fontWeight="bold"
          fill="white"
        >
          A
        </text>
        {/* Caractère 語 blanc */}
        <text
          x="17"
          y="18"
          fontFamily="serif"
          fontSize="10"
          fontWeight="bold"
          fill="white"
        >
          語
        </text>
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ──────────────────────────────────────
// Avatar Utilisateur
// ──────────────────────────────────────
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function resolveAvatarUrl(avatar) {
  if (!avatar) return null;
  // Déjà une URL complète (http/https ou data:)
  if (avatar.startsWith("http") || avatar.startsWith("data:")) return avatar;
  // Chemin relatif stocké en base (ex: "/uploads/avatars/xxx.jpg")
  return `${BACKEND_URL}${avatar}`;
}

function UserAvatar({ avatar, nom }) {
  const initiale = nom ? nom.charAt(0).toUpperCase() : "U";
  const [imgError, setImgError] = useState(false);

  const src = resolveAvatarUrl(avatar);

  if (src && !imgError) {
    return (
      <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden border-2 border-orange-200">
        <img
          src={src}
          alt="Mon avatar"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                 text-white text-xs font-bold border-2 border-orange-200"
      style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
    >
      {initiale}
    </div>
  );
}

// ──────────────────────────────────────
// Composant Message
// ──────────────────────────────────────
const LANGUES_NON_LATINES = ["Coréen", "Japonais", "Chinois", "Arabe"];

function extraireContenu(valeur) {
  if (typeof valeur !== "string") return valeur;
  try {
    const parsed = JSON.parse(valeur);
    if (parsed && typeof parsed.reponse === "string") return parsed.reponse;
  } catch {}
  return valeur;
}

function Message({ msg, langue, userAvatar, userNom }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const needsRomanisation = LANGUES_NON_LATINES.includes(langue);

  const afficher = async () => {
    if (data) {
      setShow(!show);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/traduction", { texte: msg.contenu, langue });
      setData({
        romanisation: res.data.romanisation,
        traduction: res.data.traduction,
      });
      setShow(true);
    } catch {
      setData({ romanisation: "—", traduction: "Indisponible." });
      setShow(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Message utilisateur ──
  if (msg.role === "user") {
    return (
      <div className="flex justify-end items-end gap-2">
        <div
          className="max-w-[75%] px-4 py-3 rounded-2xl rounded-br-sm
                     text-sm text-white leading-relaxed whitespace-pre-wrap"
          style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)" }}
        >
          {msg.contenu}
        </div>
        <UserAvatar avatar={userAvatar} nom={userNom} />
      </div>
    );
  }

  // ── Message IA ──
  return (
    <div className="flex justify-start items-end gap-2">
      <LinguaPathAvatar />

      <div className="max-w-[75%] flex flex-col gap-1">
        <div
          className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white
                      border border-warm-200 text-warm-800 text-sm
                      leading-relaxed whitespace-pre-wrap"
        >
          {msg.contenu}
        </div>

        {show && data && (
          <div
            className="flex flex-col gap-1.5 px-4 py-3 rounded-xl
                        bg-orange-50 border border-orange-100 text-xs"
          >
            {needsRomanisation &&
              data.romanisation &&
              data.romanisation !== "—" && (
                <>
                  <div className="flex gap-2 items-start">
                    <span className="text-orange-400 shrink-0 mt-0.5">
                      <Languages size={12} />
                    </span>
                    <span className="text-warm-600 font-mono leading-relaxed">
                      {data.romanisation}
                    </span>
                  </div>
                  <div className="border-t border-orange-200" />
                </>
              )}
            <div className="flex gap-2 items-start">
              <span className="text-orange-400 shrink-0 mt-0.5">
                <Languages size={12} />
              </span>
              <span className="text-warm-600 leading-relaxed italic">
                {data.traduction}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={afficher}
          disabled={loading}
          className="self-start text-xs text-warm-400 hover:text-orange-500
                     transition-colors px-1"
        >
          {loading ? (
            <span className="flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> Chargement...
            </span>
          ) : show ? (
            <span className="flex items-center gap-1">
              <EyeOff size={12} /> Masquer
            </span>
          ) : needsRomanisation ? (
            <span className="flex items-center gap-1">
              <Languages size={12} /> Romanisation & traduction
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Languages size={12} /> Traduction
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────
// Page Chat
// ──────────────────────────────────────
export default function Chat() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();

  // ── Infos utilisateur depuis localStorage ──
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userAvatar = storedUser.avatar || null;
  const userNom = storedUser.nom || storedUser.name || "";

  const [debutAt] = useState(Date.now());
  const [scenario, setScenario] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingScenario, setLoadingScenario] = useState(true);
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("resume");
  const [originalMessageCount, setOriginalMessageCount] = useState(0);

  const [suggestionsData, setSuggestionsData] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [microState, setMicroState] = useState("idle");
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const resScenario = await api.get(`/scenarios/${scenarioId}`);
        const scenarioData = resScenario.data.scenario;
        setScenario(scenarioData);

        const langue = scenarioData.langue;

        if (resumeId) {
          const resConv = await api.get(`/conversations/${resumeId}`);
          const conv = resConv.data.conversation;
          setHistorique(conv.messages);
          setOriginalMessageCount(conv.messages.length);

          try {
            const resSugg = await api.post("/chat/message", {
              scenarioId,
              historique: conv.messages,
              message:
                "__SUGGESTIONS_ONLY__ Do not respond in character. Just return 3 suggestions the user could say next based on the conversation history. Return JSON only.",
            });

            if (resSugg.data.suggestions?.length) {
              enrichirSuggestions(resSugg.data.suggestions, langue);
            }
          } catch {
            // pas grave
          }
        } else {
          const intro = await api.post("/chat/message", {
            scenarioId,
            historique: [],
            message: `Begin the scenario now. Write your opening message in the scenario language:
- Greet the user briefly in your role (2-3 sentences max)
- Ask ONE simple opening question to start the conversation
- The JSON suggestions field MUST contain 3 complete phrases the user could reply`,
          });

          const introMessage = {
            role: "assistant",
            contenu: extraireContenu(intro.data.reponse),
          };
          setHistorique([introMessage]);

          if (intro.data.suggestions?.length) {
            enrichirSuggestions(intro.data.suggestions, langue);
          } else {
            setSuggestionsData([]);
          }
        }
      } catch (err) {
        console.error("Erreur init chat:", err);
        setHistorique([
          {
            role: "assistant",
            contenu: "👋 Bonjour ! Je suis prêt(e) pour notre conversation.",
          },
        ]);
      } finally {
        setLoadingScenario(false);
      }
    };

    init();
  }, [scenarioId, resumeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historique]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    const langueMap = {
      Anglais: "en-US",
      Espagnol: "es-ES",
      Français: "fr-FR",
      Allemand: "de-DE",
      Coréen: "ko-KR",
      Japonais: "ja-JP",
      Chinois: "zh-CN",
      Arabe: "ar-SA",
    };
    recognition.lang = langueMap[scenario?.langue] || "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const texte = event.results[0][0].transcript;
      setMessage((prev) => prev + texte);
      setMicroState("idle");
    };

    recognition.onerror = () => setMicroState("error");
    recognition.onend = () => setMicroState("idle");

    recognitionRef.current = recognition;
  }, [scenario]);

  const toggleMicro = () => {
    if (!recognitionRef.current) return;

    if (microState === "listening") {
      recognitionRef.current.stop();
      setMicroState("idle");
    } else {
      recognitionRef.current.start();
      setMicroState("listening");
    }
  };

  const envoyerMessage = async (texte) => {
    const messageUser = (texte || message).trim();
    if (!messageUser || loading) return;

    setMessage("");
    setSuggestionsData([]);
    setLoadingSuggestions(false);

    const nouvelHistorique = [
      ...historique,
      { role: "user", contenu: messageUser },
    ];
    setHistorique(nouvelHistorique);
    setLoading(true);

    try {
      const res = await api.post("/chat/message", {
        scenarioId,
        historique: historique,
        message: messageUser,
      });

      setHistorique((prev) => [
        ...prev,
        { role: "assistant", contenu: extraireContenu(res.data.reponse) },
      ]);

      if (res.data.suggestions?.length) {
        enrichirSuggestions(res.data.suggestions);
      }
    } catch (err) {
      setHistorique((prev) => [
        ...prev,
        {
          role: "assistant",
          contenu: "❌ Erreur de connexion. Réessaie.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const enrichirSuggestions = async (suggestions, langueOverride = null) => {
    if (!suggestions?.length) {
      setSuggestionsData([]);
      setLoadingSuggestions(false);
      return;
    }

    const langue = langueOverride || scenario?.langue;

    setLoadingSuggestions(true);
    setSuggestionsData([]);

    const enriched = [];
    for (const texte of suggestions) {
      try {
        const res = await api.post("/traduction", { texte, langue });
        enriched.push({
          texte,
          roman: LANGUES_NON_LATINES.includes(langue)
            ? res.data.romanisation || ""
            : "",
          trad: res.data.traduction || "",
        });
      } catch {
        enriched.push({ texte, roman: "", trad: "" });
      }
    }

    setSuggestionsData(enriched);
    setLoadingSuggestions(false);
  };

  const terminerConversation = async () => {
    const messagesUser = historique.filter((m) => m.role === "user");

    if (messagesUser.length === 0) {
      navigate("/historique");
      return;
    }

    try {
      const duree = Math.floor((Date.now() - debutAt) / 1000);
      let conversationId = null;

      if (resumeId && historique.length > originalMessageCount) {
        await api.put(`/conversations/${resumeId}`, {
          messages: historique,
          duree,
        });
        conversationId = resumeId;
      } else if (!resumeId) {
        const res = await api.post("/conversations", {
          scenarioId,
          messages: historique,
          duree,
        });
        conversationId = res.data.conversationId;
      }

      const nouveauxMessages = historique.slice(originalMessageCount);

      if (nouveauxMessages.length > 0) {
        api
          .post("/learning-log/extraire", {
            conversationId,
            scenarioId,
            messages: nouveauxMessages,
            langue: scenario?.langue,
            niveau:
              JSON.parse(localStorage.getItem("user") || "{}")?.langues?.find(
                (l) => l.langue === scenario?.langue
              )?.niveau || "A1",
          })
          .catch((err) => console.warn("Extraction échouée :", err.message));
      }
    } catch (err) {
      console.error("Erreur sauvegarde :", err.message);
    }

    navigate("/historique");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyerMessage();
    }
  };

  if (loadingScenario) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2">
          <div
            className="w-3 h-3 rounded-full bg-orange-400 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-3 h-3 rounded-full bg-orange-400 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-3 h-3 rounded-full bg-orange-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <p className="text-warm-400 text-sm">Préparation de la conversation...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-warm-50 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div
        className="bg-white border-b border-warm-200 shadow-soft px-6 py-4
                   flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/scenarios")}
            className="text-warm-400 hover:text-warm-700 transition-colors mr-1"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-2xl">{scenario?.emoji}</span>
          <div>
            <h1 className="font-semibold text-warm-900 text-sm">
              {scenario?.titre}
            </h1>
            <p className="text-xs text-warm-400">{scenario?.langue}</p>
          </div>
        </div>
        <button
          onClick={terminerConversation}
          className="px-4 py-1.5 rounded-xl text-xs font-semibold
               text-warm-600 border border-warm-200 hover:bg-warm-100 transition-colors"
        >
          Terminer
        </button>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {historique.map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              langue={scenario?.langue}
              userAvatar={userAvatar}
              userNom={userNom}
            />
          ))}

          {loading && (
            <div className="flex justify-start items-end gap-2">
              <LinguaPathAvatar />
              <div className="bg-white border border-warm-200 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  <div
                    className="w-2 h-2 rounded-full bg-warm-300 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-warm-300 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-warm-300 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Zone de saisie + suggestions ── */}
      <div className="bg-white border-t border-warm-200 px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {/* Skeleton suggestions */}
          {loadingSuggestions && !loading && (
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1.5 px-3 py-2 rounded-xl
                    bg-warm-100 border border-warm-200 min-w-30 max-w-45"
                >
                  <div className="h-3 bg-warm-200 rounded animate-pulse w-full" />
                  <div className="h-2 bg-warm-200 rounded animate-pulse w-3/4" />
                  <div className="h-2 bg-orange-100 rounded animate-pulse w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Cartes de suggestions */}
          {suggestionsData.length > 0 && !loading && !loadingSuggestions && (
            <div className="flex gap-2 flex-wrap">
              {suggestionsData.map((s, i) => (
                <button
                  key={i}
                  onClick={() => envoyerMessage(s.texte)}
                  className="flex flex-col items-start px-3 py-2 rounded-xl text-xs
                   bg-warm-100 border border-warm-200 text-left
                   hover:bg-orange-50 hover:border-orange-300
                   transition-all max-w-45"
                >
                  <span className="font-medium text-warm-800">{s.texte}</span>
                  {s.roman && LANGUES_NON_LATINES.includes(scenario?.langue) && (
                    <span className="text-warm-400 font-mono text-[10px] mt-0.5">
                      {s.roman}
                    </span>
                  )}
                  {s.trad && (
                    <span className="text-orange-500 italic text-[10px]">
                      {s.trad}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Textarea + micro + envoyer */}
          <div className="flex gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écris ton message... (Entrée pour envoyer)"
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl border border-warm-200
                         bg-warm-50 text-warm-900 text-sm resize-none
                         focus:outline-none focus:border-orange-500
                         focus:ring-2 focus:ring-orange-500/10 transition-all"
            />

            {(window.SpeechRecognition || window.webkitSpeechRecognition) && (
              <button
                onClick={toggleMicro}
                title={microState === "listening" ? "Arrêter" : "Parler"}
                className={`px-4 py-3 rounded-xl font-semibold text-sm
                            transition-all border
                            ${
                              microState === "listening"
                                ? "bg-red-50 border-red-300 text-red-500 animate-pulse"
                                : microState === "error"
                                ? "bg-red-50 border-red-200 text-red-400"
                                : "bg-warm-50 border-warm-200 text-warm-500 hover:border-orange-300 hover:text-orange-500"
                            }`}
              >
                {microState === "listening" ? (
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse block" />
                ) : (
                  <Mic size={18} />
                )}
              </button>
            )}

            <button
              onClick={() => envoyerMessage()}
              disabled={!message.trim() || loading}
              className="px-5 py-3 rounded-xl font-semibold text-white text-sm
                         transition-opacity disabled:opacity-40 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #EA580C)",
              }}
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {microState === "listening" && (
            <p className="text-xs text-red-400 text-center animate-pulse flex items-center justify-center gap-1">
              <Mic size={12} /> Écoute en cours... Parle maintenant
            </p>
          )}
          {microState === "error" && (
            <p className="text-xs text-red-400 text-center">
              Micro non disponible — vérifie les permissions du navigateur
            </p>
          )}
        </div>
      </div>
    </div>
  );
}