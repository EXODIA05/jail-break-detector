import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

# 1. Load data
print("Loading data...")
train_df = pd.read_csv("train_jailbreak.csv").dropna(subset=["prompt", "label"])
val_df = pd.read_csv("val_jailbreak.csv").dropna(subset=["prompt", "label"])

X_train, y_train = train_df["prompt"], train_df["label"]
X_val, y_val = val_df["prompt"], val_df["label"]

# 2. Memory-Efficient Pipeline
pipeline = Pipeline([
    # Word n-grams (1 to 2 words). Stops the vocabulary from exploding.
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=25000, sublinear_tf=True)),
    
    # SGDClassifier uses practically zero RAM compared to LogisticRegression(saga).
    ("clf", SGDClassifier(loss="log_loss", class_weight="balanced", n_jobs=-1, random_state=42))
])

# 3. Train and Evaluate
print("Training lightweight model...")
pipeline.fit(X_train, y_train)

print("\n--- Validation Performance ---")
y_pred = pipeline.predict(X_val)
print(classification_report(y_val, y_pred, target_names=["BENIGN (0)", "JAILBREAK (1)"]))

joblib.dump(pipeline, "jailbreak_detector_light.joblib")
print("Saved lightweight model!")