from datasets import load_dataset
import pandas as pd
from sklearn.model_selection import train_test_split

def prepare_jailbreak_data():
    print("Loading dataset...")
    dataset = load_dataset("allenai/wildjailbreak", "train", split="train", delimiter="\t", keep_default_na=False)
    df = dataset.to_pandas()

    # 1. Extract the actual prompt the model sees
    # If the row is an adversarial type, the input is in the 'adversarial' column.
    # Otherwise, it is a standard prompt in the 'vanilla' column.
    def extract_prompt(row):
        if 'adversarial' in str(row['data_type']):
            return row['adversarial']
        return row['vanilla']
        
    df['prompt'] = df.apply(extract_prompt, axis=1)

    # 2. Map data_type to a binary classification label
    # 1 = Block (Harmful/Jailbreak), 0 = Allow (Benign)
    def assign_label(data_type):
        if 'harmful' in str(data_type):
            return 1
        return 0

    df['label'] = df['data_type'].apply(assign_label)

    # 3. Drop unneeded columns to save memory
    df = df[['prompt', 'label']]

    # 4. CPU Optimization: Filter out massive prompts
    # Limiting word count ensures the transformer max_seq_length can stay small (e.g., 256),
    # which is crucial for fast CPU training and inference.
    df = df[df['prompt'].apply(lambda x: len(str(x).split()) < 350)]  
    # Drop any nulls that may have been generated
    df = df.dropna(subset=['prompt', 'label'])

    # 5. Stratified split (75% Train, 25% Validation)
    train_df, val_df = train_test_split(
        df, 
        test_size=0.25, 
        random_state=42, 
        stratify=df['label']  # Maintains the 0/1 ratio in both datasets
    )

    print(f"Training samples prepared: {len(train_df)}")
    print(f"Validation samples prepared: {len(val_df)}")
    
    # Save to disk for Phase 2
    train_df.to_csv("train_jailbreak.csv", index=False)
    val_df.to_csv("val_jailbreak.csv", index=False)
    
    return train_df, val_df

if __name__ == "__main__":
    prepare_jailbreak_data()
