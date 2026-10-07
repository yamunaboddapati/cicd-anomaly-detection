import PageHeader from "../components/PageHeader"

const metrics = [
  { metric: "ROC-AUC",   iso: "0.739",  xgb: "0.9997", better: "xgb" },
  { metric: "Precision", iso: "0.34",   xgb: "0.95",   better: "xgb" },
  { metric: "Recall",    iso: "0.16",   xgb: "1.00",   better: "xgb" },
  { metric: "F1-Score",  iso: "0.22",   xgb: "0.97",   better: "xgb" },
  { metric: "Accuracy",  iso: "87%",    xgb: "99%",    better: "xgb" },
]

const charts = [
  {
    title: "Confusion Matrices",
    description: "True vs predicted labels for both models on 9,000 test samples",
    file: "/charts/ConfusionMatrices.png",
  },
  {
    title: "ROC Curve Comparison",
    description: "Isolation Forest (AUC 0.739) vs XGBoost (AUC 0.9997)",
    file: "/charts/RocCurve.png",
  },
  {
    title: "XGBoost Feature Importance",
    description: "deploy_duration_sec and cpu_usage_pct are the strongest predictors",
    file: "/charts/FeatureImportance.png",
  },
  {
    title: "Anomaly Score Distribution",
    description: "Isolation Forest scores across full dataset with threshold at 0.0",
    file: "/charts/AnomalyScores.png",
  },
]

export default function ModelPerformance() {
  return (
    <div className="p-8">
      <PageHeader
        title="Model Performance"
        description="Evaluation results for Isolation Forest and XGBoost on the CI/CD dataset"
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Samples",   value: "45,000" },
          { label: "Test Set Size",   value: "9,000"  },
          { label: "Anomaly Ratio",   value: "11.1%"  },
          { label: "Features Used",   value: "10"     },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-border rounded-lg p-4">
            <p className="text-xs text-muted uppercase tracking-wider mb-2">{label}</p>
            <p className="text-xl font-semibold text-text font-mono">{value}</p>
          </div>
        ))}
      </div>

      {/* Metrics Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-medium text-text">Performance Metrics</p>
          <p className="text-xs text-muted mt-0.5">Evaluated on held-out test set (20% split)</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs text-muted font-medium">Metric</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-medium">
                Isolation Forest
                <span className="ml-2 text-xs px-1.5 py-0.5 bg-surface2 rounded text-faint font-normal">
                  Unsupervised
                </span>
              </th>
              <th className="text-left px-5 py-3 text-xs text-muted font-medium">
                XGBoost
                <span className="ml-2 text-xs px-1.5 py-0.5 bg-accent/10 rounded text-accent font-normal">
                  Supervised
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(({ metric, iso, xgb }) => (
              <tr key={metric} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-xs text-muted">{metric}</td>
                <td className="px-5 py-3 text-sm text-text font-mono">{iso}</td>
                <td className="px-5 py-3 text-sm text-accent font-mono font-medium">{xgb}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model Descriptions */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-text">Isolation Forest</p>
            <span className="text-xs px-2 py-1 bg-surface2 rounded text-muted">Unsupervised</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Detects anomalies without using labels by isolating observations using random
            partitioning. Anomalies are isolated faster as they require fewer splits.
            Trained on pipeline execution metrics to flag unusual resource usage patterns.
          </p>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted">ROC-AUC</p>
              <p className="text-lg font-semibold text-text font-mono">0.739</p>
            </div>
            <div>
              <p className="text-xs text-muted">Estimators</p>
              <p className="text-lg font-semibold text-text font-mono">300</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-text">XGBoost</p>
            <span className="text-xs px-2 py-1 bg-accent/10 rounded text-accent">Supervised</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Gradient boosted decision tree classifier trained on labelled anomaly data.
            Uses extreme outlier thresholds (97th percentile) across deploy duration,
            CPU usage, memory and build duration to define anomaly labels.
          </p>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted">ROC-AUC</p>
              <p className="text-lg font-semibold text-accent font-mono">0.9997</p>
            </div>
            <div>
              <p className="text-xs text-muted">Estimators</p>
              <p className="text-lg font-semibold text-text font-mono">100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div>
        <p className="text-sm font-medium text-text mb-4">Evaluation Charts</p>
        <div className="grid grid-cols-2 gap-5">
          {charts.map(({ title, description, file }) => (
            <div key={title} className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-text">{title}</p>
                <p className="text-xs text-muted mt-0.5">{description}</p>
              </div>
              <div className="p-4 bg-surface2">
                <img
                  src={file}
                  alt={title}
                  className="w-full rounded-md"
                  onError={(e) => {
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "flex"
                  }}
                />
                <div
                  className="hidden w-full h-40 items-center justify-center text-xs text-muted rounded-md border border-border"
                  style={{ display: "none" }}
                >
                  Place {file.split("/").pop()} in public/charts/
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}