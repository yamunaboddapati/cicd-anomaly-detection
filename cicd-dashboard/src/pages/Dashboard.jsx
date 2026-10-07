import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import StatCard from "../components/StatCard"
import PageHeader from "../components/PageHeader"
import { useEffect } from "react"

const pieData = [
  { name: "Normal", value: 7998 },
  { name: "Anomaly", value: 1002 },
]

const featureData = [
  { feature: "deploy_dur", importance: 0.30 },
  { feature: "cpu_usage", importance: 0.28 },
  { feature: "build_dur", importance: 0.20 },
  { feature: "memory_mb", importance: 0.15 },
  { feature: "is_flaky", importance: 0.04 },
]

const COLORS = ["#4f98a3", "#dd6974"]

export default function Dashboard() {

  useEffect(() => {
  fetch("http://localhost:8000/stats")
    .then(r => r.json())
    .then(stats => {
    })
}, [])

  return (
    <div className="p-8">
      <PageHeader title="Dashboard" description="CI/CD pipeline anomaly detection overview" />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Runs" value="45,000" sub="Full dataset" />
        <StatCard title="Anomalies Detected" value="1,002" sub="11.1% of test set" accent />
        <StatCard title="XGBoost ROC-AUC" value="0.9997" sub="Supervised model" />
        <StatCard title="Isolation Forest AUC" value="0.739" sub="Unsupervised model" />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-sm font-medium text-text mb-4">Normal vs Anomaly Distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#e8e8e8" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-6 justify-center mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-xs text-muted">{d.name} ({d.value.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <p className="text-sm font-medium text-text mb-4">XGBoost Feature Importance</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={featureData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" tick={{ fill: "#6b6b6b", fontSize: 11 }} axisLine={false} tickLine={false} width={75} />
              <Tooltip
                contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: "6px", color: "#e8e8e8" }}
              />
              <Bar dataKey="importance" fill="#4f98a3" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-5">
        <p className="text-sm font-medium text-text mb-1">Model Performance Summary</p>
        <p className="text-xs text-muted mb-4">Evaluation on 9,000 test samples</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Metric", "Isolation Forest", "XGBoost"].map(h => (
                <th key={h} className="text-left py-2 px-3 text-xs text-muted font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["ROC-AUC", "0.739", "0.9997"],
              ["Precision", "0.34", "0.95"],
              ["Recall", "0.16", "1.00"],
              ["F1-Score", "0.22", "0.97"],
              ["Accuracy", "87%", "99%"],
            ].map(([metric, iso, xgb]) => (
              <tr key={metric} className="border-b border-border last:border-0">
                <td className="py-2.5 px-3 text-muted text-xs">{metric}</td>
                <td className="py-2.5 px-3 text-text font-mono text-xs">{iso}</td>
                <td className="py-2.5 px-3 text-accent font-mono text-xs">{xgb}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}