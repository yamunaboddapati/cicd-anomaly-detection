import { useState, useEffect } from "react"
import { Download, Search, Filter } from "lucide-react"
import PageHeader from "../components/PageHeader"

const severityColor = {
  LOW: "text-green-400 bg-green-400/10",
  MEDIUM: "text-yellow-400 bg-yellow-400/10",
  HIGH: "text-orange-400 bg-orange-400/10",
  CRITICAL: "text-red-400 bg-red-400/10",
}

const predictionColor = {
  NORMAL: "text-green-400 bg-green-400/10",
  ANOMALY: "text-red-400 bg-red-400/10",
  "ANOMALY DETECTED": "text-red-400 bg-red-400/10",
}

export default function History() {
  const [data, setData] = useState([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    fetch("http://localhost:8000/history")
      .then(r => r.json())
      .then(setData)
      .catch(() => setData([]))
  }, [])

  const filtered = data.filter((row) => {
    if (!row || !row.run_id) return false
    const matchSearch = row.run_id.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === "ALL" ||
      (filter === "ANOMALY" && row.combined_verdict === "ANOMALY DETECTED") ||
      (filter === "NORMAL" && row.combined_verdict === "NORMAL")
    return matchSearch && matchFilter
  })

  const exportCSV = () => {
    const headers = ["Run ID", "Timestamp", "XGBoost", "Probability", "Iso Forest", "Severity"]
    const rows = filtered.map(r => [
      r.run_id,
      r.timestamp,
      r.xgboost?.prediction,
      r.xgboost?.failure_probability + "%",
      r.isolation_forest?.prediction,
      r.severity,
    ])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "pipeline_history.csv"
    a.click()
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Pipeline Run History"
        description="All analysed pipeline runs with prediction results"
      />

      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search run ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface border border-border rounded-md pl-8 pr-4 py-2 text-sm text-text placeholder-muted focus:outline-none focus:border-accent transition-colors w-52"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-muted" />
            {["ALL", "NORMAL", "ANOMALY"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  filter === f
                    ? "bg-accent text-white"
                    : "bg-surface border border-border text-muted hover:text-text"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-md text-xs text-muted hover:text-text transition-colors"
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Run ID", "Timestamp", "Verdict", "XGBoost Prob", "XGBoost", "Iso Forest", "Severity", "Recommendation"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted text-sm">
                  {data.length === 0 ? "No predictions yet. Run a prediction first." : "No runs found."}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.run_id} className="border-b border-border last:border-0 hover:bg-surface2 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-accent">{row.run_id}</td>
                  <td className="px-4 py-3 text-xs text-muted">{row.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${predictionColor[row.combined_verdict]}`}>
                      {row.combined_verdict}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-text font-mono">
                    {row.xgboost?.failure_probability}%
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${predictionColor[row.xgboost?.prediction]}`}>
                      {row.xgboost?.prediction}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${predictionColor[row.isolation_forest?.prediction]}`}>
                      {row.isolation_forest?.prediction}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${severityColor[row.severity] || "text-muted"}`}>
                      {row.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted max-w-xs truncate">
                    {row.recommendation}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted">{filtered.length} runs shown</p>
          <p className="text-xs text-muted">
            {filtered.filter(r => r.combined_verdict === "ANOMALY DETECTED").length} anomalies detected
          </p>
        </div>
      </div>
    </div>
  )
}