import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-panel border border-gold/20 rounded-lg p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-gold-light">Entrar</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-neutral-700 rounded px-3 py-2 text-sm focus:border-gold outline-none"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface border border-neutral-700 rounded px-3 py-2 text-sm focus:border-gold outline-none"
          required
        />
        <button
          type="submit"
          className="w-full bg-gold text-surface font-medium rounded py-2 hover:bg-gold-light transition"
        >
          Entrar
        </button>
        <p className="text-sm text-neutral-400">
          Não tem conta? <Link to="/register" className="text-gold-light">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}
