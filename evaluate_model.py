import joblib
import time
import pandas as pd
import numpy as np
from sklearn.metrics import precision_recall_curve, roc_auc_score, f1_score

# 1. Load the model and validation dataset
print("Loading model and validation data...")
model = joblib.load("jailbreak_detector_light.joblib")
val_df = pd.read_csv("val_jailbreak.csv").dropna(subset=["prompt", "label"])

X_val = val_df["prompt"]
y_true = val_df["label"].values

# 2. Get Probability Scores
y_probs = model.predict_proba(X_val)[:, 1]

# 3. Calculate ROC AUC
roc_auc = roc_auc_score(y_true, y_probs)
print(f"\n--- Metrics ---")
print(f"ROC AUC Score: {roc_auc:.4f}")

# 4. Find the Optimal Threshold using Precision-Recall Curve
precisions, recalls, thresholds = precision_recall_curve(y_true, y_probs)

# Calculate F1 scores for each threshold to find the mathematical optimum
f1_scores = 2 * (precisions * recalls) / (precisions + recalls + 1e-8)
optimal_idx = np.argmax(f1_scores)
optimal_threshold = thresholds[optimal_idx]

print(f"\n--- Threshold Calibration ---")
print(f"Standard Threshold (0.50) F1: {f1_score(y_true, (y_probs >= 0.5).astype(int)):.4f}")
print(f"Optimal Threshold ({optimal_threshold:.4f}) F1: {f1_scores[optimal_idx]:.4f}")
print(f"Precision at Optimal: {precisions[optimal_idx]:.4f}")
print(f"Recall at Optimal: {recalls[optimal_idx]:.4f}")

# 5. Latency Benchmarking (Simulating real-time traffic)
print("\n--- Latency Benchmark ---")
# If you are placing this guardrail in front of a Gemini API application, speed is critical.
sample_prompts = X_val.sample(1000, random_state=42).tolist()
latencies = []

for prompt in sample_prompts:
    start_time = time.perf_counter()
    _ = model.predict_proba([prompt])
    end_time = time.perf_counter()
    latencies.append((end_time - start_time) * 1000) # Convert to ms

print(f"Average Latency: {np.mean(latencies):.2f} ms")
print(f"95th Percentile (P95): {np.percentile(latencies, 95):.2f} ms")
print(f"99th Percentile (P99): {np.percentile(latencies, 99):.2f} ms")