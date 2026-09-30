import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password);
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
        <h1 className="text-xl font-semibold text-gold-light">Criar conta</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface border border-neutral-700 rounded px-3 py-2 text-sm focus:border-gold outline-none"
          required
        />
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
          Cadastrar
        </button>
        <p className="text-sm text-neutral-400">
          Já tem conta? <Link to="/login" className="text-gold-light">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
