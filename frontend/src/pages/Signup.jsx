import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";
import Logo from "../components/Logo";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nom: "",
    email: "",
    password: "",
    niveau: "A1",
    languesCibles: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const langues = ["Français", "Anglais", "Espagnol", "Allemand", "Arabe"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLangue = (langue) => {
    const already = form.languesCibles.includes(langue);
    setForm({
      ...form,
      languesCibles: already
        ? form.languesCibles.filter((l) => l !== langue)
        : [...form.languesCibles, langue],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await register(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-base-200 flex items-center justify-center py-8'>
      <div className='card w-full max-w-md bg-base-100 shadow-xl'>
        <div className='card-body'>
          <div className='flex flex-col items-center gap-1 mb-4'>
            <Logo size='full' />
            <p className='text-base-content/50 text-sm mt-2'>
              Rejoins LinguaPath et commence à apprendre
            </p>
          </div>

          {error && (
            <div className='alert alert-error mb-4'>
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className='flex flex-col gap-4'
          >
            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Nom complet</span>
              </label>
              <input
                type='text'
                name='nom'
                placeholder='John Doe'
                className='input input-bordered w-full'
                value={form.nom}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Email</span>
              </label>
              <input
                type='email'
                name='email'
                placeholder='john.doe@example.com'
                className='input input-bordered w-full'
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Mot de passe</span>
              </label>
              <input
                type='password'
                name='password'
                placeholder='••••••••'
                className='input input-bordered w-full'
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Niveau actuel</span>
              </label>
              <select
                name='niveau'
                className='select select-bordered w-full'
                value={form.niveau}
                onChange={handleChange}
              >
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((n) => (
                  <option
                    key={n}
                    value={n}
                  >
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className='form-control'>
              <label className='label'>
                <span className='label-text'>Langues à apprendre</span>
              </label>
              <div className='flex flex-wrap gap-2'>
                {langues.map((l) => (
                  <button
                    key={l}
                    type='button'
                    onClick={() => handleLangue(l)}
                    className={`btn btn-sm ${
                      form.languesCibles.includes(l)
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              type='submit'
              className={`btn btn-primary w-full mt-2 ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className='text-center mt-4 text-sm'>
            Déjà un compte ?{" "}
            <Link
              to='/login'
              className='link link-primary'
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
