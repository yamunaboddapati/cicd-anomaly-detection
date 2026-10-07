export default function StatCard({ title, value, sub, accent = false }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <p className="text-xs text-muted uppercase tracking-wider mb-3">{title}</p>
      <p className={`text-2xl font-semibold ${accent ? "text-accent" : "text-text"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  )
}