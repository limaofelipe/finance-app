import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SummaryCard from "../components/SummaryCard";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/dashboard/summary")
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-gold-light">
          Olá, {user?.name}
        </h1>
        <button
          onClick={logout}
          className="text-sm text-neutral-400 hover:text-gold-light"
        >
          Sair
        </button>
      </header>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Saldo atual" value={summary.balance} accent />
          <SummaryCard label="Receitas (mês)" value={summary.totalIncome} />
          <SummaryCard label="Despesas (mês)" value={summary.totalExpense} />
        </div>
      )}
    </div>
  );
}
