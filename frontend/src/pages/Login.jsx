import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    <div className='min-h-screen bg-base-200 flex items-center justify-center'>
      <div className='card w-full max-w-md bg-base-100 shadow-xl'>
        <div className='card-body'>
          <div className='flex flex-col items-center gap-1 mb-4'>
            <Logo size='full' />
            <p className='text-base-content/50 text-sm mt-2'>
              Connecte-toi pour continuer
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

            <button
              type='submit'
              className={`btn btn-primary w-full mt-2 ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className='text-center mt-4 text-sm'>
            Pas encore de compte ?{" "}
            <Link
              to='/signup'
              className='link link-primary'
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
