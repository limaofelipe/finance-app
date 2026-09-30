export default function SummaryCard({ label, value, accent }) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

  return (
    <div
      className={`bg-panel rounded-lg p-6 border ${
        accent ? "border-gold" : "border-neutral-800"
      }`}
    >
      <p className="text-sm text-neutral-400">{label}</p>
      <p
        className={`text-2xl font-semibold mt-2 ${
          accent ? "text-gold-light" : "text-neutral-100"
        }`}
      >
        {formatted}
      </p>
    </div>
  );
}
