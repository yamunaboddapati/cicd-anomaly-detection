# CI/CD Pipeline Anomaly Detection

Scores CI/CD pipeline runs for anomalies and serves the result through a REST API. Built as my MSc Computing Science dissertation project (Griffith College Dublin, 2026).

Given the metrics of a pipeline run (build, test and deploy durations, CPU, memory, CI tool, language, OS, cloud provider), the service returns a verdict, a severity level and a suggested action.

## How it works

```
Kaggle dataset  ->  preprocessing/preprocess.ipynb  ->  models/*.pkl + thresholds.json
                                                              |
                         dashboard (cicd-dashboard/)  <->  FastAPI service (app.py)
```

1. **Preprocessing and training** (`preprocessing/preprocess.ipynb`): exploratory analysis of 45,000 pipeline runs, feature selection, label construction, and training of two models.
2. **Isolation Forest** (unsupervised): flags runs that look unusual without using any labels.
3. **XGBoost** (supervised): predicts whether a run breaches the anomaly thresholds.
4. **API** (`app.py`): loads both models, scores a run, and combines the two outputs into a verdict (`ANOMALY DETECTED` / `NORMAL`), a severity (`LOW` to `CRITICAL`) and a recommendation.
5. **Dashboard** (`cicd-dashboard/`): a React front end (Vite, Tailwind CSS, Recharts) that calls the API and displays the results.

## Results

Test set: 9,000 runs (20% hold-out), 11.5% labelled anomalous.

| Model | ROC-AUC | Precision (anomaly) | Recall (anomaly) |
|---|---|---|---|
| Isolation Forest | 0.74 | 0.34 | 0.16 |
| XGBoost | 0.9998 | 0.95 | 1.00 |

**Read these numbers with care.** The dataset has no ground-truth anomaly label, so I defined one: a run is anomalous if build duration, deploy duration, CPU or memory is above its 97th percentile. XGBoost is trained on those same four metrics, so its near-perfect score shows it has learned that threshold rule, not that it can find unknown anomalies. The Isolation Forest figures are the honest measure of unsupervised detection on this data. See Limitations.

## Run it locally

Requires Python 3.11 or newer.

```bash
git clone https://github.com/yamunaboddapati/cicd-anomaly-detection.git
cd cicd-anomaly-detection
python -m venv venv
source venv/Scripts/activate      # Windows Git Bash; use venv/bin/activate on Linux/macOS
pip install -r requirements.txt
python app.py
```

The API runs at `http://127.0.0.1:8000`. Interactive docs are at `http://127.0.0.1:8000/docs`.

### Dashboard

Requires Node.js. In a second terminal, with the API still running:

```bash
cd cicd-dashboard
npm install
npm run dev
```

The dashboard opens at `http://localhost:5173`.

### Example request

```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "build_duration_sec": 3550,
    "test_duration_sec": 900,
    "deploy_duration_sec": 600,
    "cpu_usage_pct": 94.0,
    "memory_usage_mb": 18000,
    "ci_tool": 4,
    "language": 4,
    "os": 1,
    "cloud_provider": 0,
    "is_flaky_test": 0
  }'
```

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Service and model status |
| POST | `/predict` | Score one pipeline run |
| GET | `/history` | Runs scored since startup, newest first |
| GET | `/stats` | Totals and anomaly rate since startup |

### Category codes

Categorical inputs are sent as integers (alphabetical label encoding from the notebook).

| Field | Codes |
|---|---|
| `ci_tool` | 0 Azure DevOps, 1 CircleCI, 2 GitHub Actions, 3 GitLab CI, 4 Jenkins |
| `language` | 0 C++, 1 Go, 2 Java, 3 NodeJS, 4 Python, 5 Rust |
| `os` | 0 macos-latest, 1 ubuntu-latest, 2 windows-latest |
| `cloud_provider` | 0 AWS, 1 Azure, 2 GCP, 3 On-Prem |
| `is_flaky_test` | 0 no, 1 yes |

## Retrain the models

1. Download the [CI/CD Pipeline Failure Logs Dataset for AIOps](https://www.kaggle.com/datasets/mirzayasirabdullah07/cicd-pipeline-failure-logs-dataset-for-aiops) from Kaggle and place `ci_cd_pipeline_failure_logs_dataset.csv` in the project root.
2. Install the notebook extras: `pip install jupyter matplotlib seaborn`
3. Create the output folders: `mkdir -p preprocessing/data preprocessing/output preprocessing/models`
4. Run `preprocessing/preprocess.ipynb` from top to bottom.

## Project structure

```
app.py                      FastAPI service
requirements.txt            API dependencies
preprocessing/
  preprocess.ipynb          EDA, labelling, training, evaluation
  models/                   Trained models and thresholds
  output/                   Charts produced by the notebook
cicd-dashboard/             React dashboard (Vite)
```

## Limitations

- **Labels are derived from the features.** As described under Results, the anomaly label is a threshold rule on four of the model inputs, which inflates the supervised score.
- **The dataset is synthetic.** Feature distributions are close to uniform and uncorrelated, so results will not transfer directly to a real pipeline.
- **Thresholds were computed on the full dataset** before the train/test split.
- **Label encoders are not saved**, so callers must send integer codes using the table above.
- **Run history is held in memory** and is lost on restart.

## Next steps

- Use the dataset's own outcome columns (`incident_created`, `rollback_triggered`) as the target, so the model predicts something it is not given.
- Evaluate on real pipeline logs (for example, GitHub Actions run data).
- Save the encoders in a single scikit-learn pipeline and accept category names in the API.
- Persist history in a database and add a Dockerfile and CI workflow.

## Tech stack

- **Backend and ML:** Python, FastAPI, scikit-learn, XGBoost, pandas, Jupyter
- **Dashboard:** React, Vite, Tailwind CSS, Recharts, Axios
