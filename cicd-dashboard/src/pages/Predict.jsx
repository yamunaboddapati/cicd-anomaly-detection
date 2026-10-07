import { useState } from "react"
import { Cpu, AlertTriangle, CheckCircle, Loader } from "lucide-react"
import PageHeader from "../components/PageHeader"

const defaultForm = {
  build_duration_sec: "",
  test_duration_sec: "",
  deploy_duration_sec: "",
  cpu_usage_pct: "",
  memory_usage_mb: "",
  ci_tool: "0",
  language: "0",
  os: "0",
  cloud_provider: "0",
  is_flaky_test: "0",
}

const ciTools = ["Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Azure DevOps"]
const languages = ["Python", "JavaScript", "Java", "Go", "Ruby"]
const osList = ["Ubuntu", "Windows", "macOS", "CentOS", "Debian"]
const cloudProviders = ["AWS", "Azure", "GCP", "On-Prem", "DigitalOcean"]

export default function Predict() {
  const [form, setForm] = useState(defaultForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

const handleSubmit = async (e) => {
  e.preventDefault()          
  setLoading(true)
  setError(null)
  setResult(null)

  try {
    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",          // ← must be POST not GET
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        build_duration_sec: parseFloat(form.build_duration_sec),
        test_duration_sec: parseFloat(form.test_duration_sec),
        deploy_duration_sec: parseFloat(form.deploy_duration_sec),
        cpu_usage_pct: parseFloat(form.cpu_usage_pct),
        memory_usage_mb: parseFloat(form.memory_usage_mb),
        ci_tool: parseInt(form.ci_tool),
        language: parseInt(form.language),
        os: parseInt(form.os),
        cloud_provider: parseInt(form.cloud_provider),
        is_flaky_test: parseInt(form.is_flaky_test),
      }),
    })

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`)
    }

    const data = await response.json()
    setResult(data)
  } catch (err) {
    setError("Could not connect to backend. Make sure FastAPI is running on port 8000.")
  } finally {
    setLoading(false)
  }
}
  const handleReset = () => {
    setForm(defaultForm)
    setResult(null)
    setError(null)
  }

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title="Predict Pipeline Run"
        description="Enter pipeline execution data to get anomaly detection results from both models"
      />

      <div className="grid grid-cols-2 gap-8">
        {/* ── FORM ── */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-text mb-5">Pipeline Execution Data</p>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Numeric inputs */}
            {[
              { name: "build_duration_sec", label: "Build Duration (sec)" },
              { name: "test_duration_sec", label: "Test Duration (sec)" },
              { name: "deploy_duration_sec", label: "Deploy Duration (sec)" },
              { name: "cpu_usage_pct", label: "CPU Usage (%)" },
              { name: "memory_usage_mb", label: "Memory Usage (MB)" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-xs text-muted mb-1.5">{label}</label>
                <input
                  type="number"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-text placeholder-faint focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            ))}

            {/* Dropdowns */}
            {[
              { name: "ci_tool", label: "CI Tool", options: ciTools },
              { name: "language", label: "Language", options: languages },
              { name: "os", label: "Operating System", options: osList },
              { name: "cloud_provider", label: "Cloud Provider", options: cloudProviders },
            ].map(({ name, label, options }) => (
              <div key={name}>
                <label className="block text-xs text-muted mb-1.5">{label}</label>
                <select
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
                >
                  {options.map((opt, i) => (
                    <option key={opt} value={i}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}

            <div>
              <label className="block text-xs text-muted mb-1.5">Flaky Test</label>
              <select
                name="is_flaky_test"
                value={form.is_flaky_test}
                onChange={handleChange}
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium py-2.5 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? <Loader size={14} className="animate-spin" /> : <Cpu size={14} />}
                {loading ? "Analysing..." : "Run Prediction"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 border border-border text-muted text-sm rounded-md hover:text-text hover:border-faint transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {!result && !error && !loading && (
            <div className="bg-surface border border-border rounded-lg p-6 h-full flex flex-col items-center justify-center text-center">
              <Cpu size={32} className="text-faint mb-3" />
              <p className="text-sm text-muted">Fill in the form and click</p>
              <p className="text-sm text-muted">Run Prediction to see results</p>
            </div>
          )}

          {error && (
            <div className="bg-surface border border-danger rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={15} className="text-danger" />
                <p className="text-sm font-medium text-danger">Connection Error</p>
              </div>
              <p className="text-xs text-muted">{error}</p>
            </div>
          )}

          {result && (
            <>
              {/* Combined verdict */}
              <div className={`border rounded-lg p-5 ${result.combined_verdict === "ANOMALY DETECTED"
                ? "bg-surface border-danger"
                : "bg-surface border-success"}`}>
                <div className="flex items-center gap-3">
                  {result.combined_verdict === "ANOMALY DETECTED"
                    ? <AlertTriangle size={20} className="text-danger" />
                    : <CheckCircle size={20} className="text-success" />}
                  <div>
                    <p className="text-sm font-semibold text-text">{result.combined_verdict}</p>
                    <p className="text-xs text-muted mt-0.5">Based on both model predictions</p>
                  </div>
                </div>
              </div>

              {/* XGBoost result */}
              <div className="bg-surface border border-border rounded-lg p-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-3">XGBoost — Failure Prediction</p>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-2xl font-semibold text-text font-mono">
                    {result.xgboost.failure_probability}%
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    result.xgboost.prediction === "ANOMALY"
                      ? "bg-danger/10 text-danger"
                      : "bg-success/10 text-success"
                  }`}>
                    {result.xgboost.prediction}
                  </span>
                </div>
                <div className="w-full bg-surface2 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${result.xgboost.failure_probability}%`,
                      background: result.xgboost.failure_probability > 50 ? "#dd6974" : "#4f98a3"
                    }}
                  />
                </div>
                <p className="text-xs text-muted mt-2">
                  Confidence: {result.xgboost.confidence}
                </p>
              </div>

              {/* Isolation Forest result */}
              <div className="bg-surface border border-border rounded-lg p-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-3">Isolation Forest — Anomaly Score</p>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-2xl font-semibold text-text font-mono">
                    {result.isolation_forest.anomaly_score}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    result.isolation_forest.flag
                      ? "bg-danger/10 text-danger"
                      : "bg-success/10 text-success"
                  }`}>
                    {result.isolation_forest.flag ? "ANOMALY" : "NORMAL"}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  Higher score indicates more anomalous behaviour
                </p>
              </div>

              {/* Recommendation */}
              <div className="bg-surface border border-border rounded-lg p-5">
                <p className="text-xs text-muted uppercase tracking-wider mb-2">Recommendation</p>
                <p className="text-sm text-text">{result.recommendation}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}