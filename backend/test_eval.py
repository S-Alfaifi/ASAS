import sys
sys.path.append('c:\\Antigravity_Projects\\ASAS_V1\\backend')
from app import create_app
from app.services.sentiment import SentimentService
from app.services.preprocessing import ArabicPreprocessor
import pandas as pd
import time

app = create_app()
with app.app_context():
    print("Testing against golden dataset...")
    df = pd.read_csv('model_performance_golden.csv')
    correct = 0
    total = 0
    
    start_time = time.time()
    for _, row in df.iterrows():
        text = str(row['Text'])
        true = str(row['True_Label']).lower()
        cleaned = ArabicPreprocessor.preprocess(text)
        if not cleaned: continue
        pred = SentimentService.predict(cleaned)['sentiment']
        total += 1
        if pred == true:
            correct += 1
    end_time = time.time()
    
    accuracy = (correct / total * 100) if total > 0 else 0
    print(f"Total Evaluated: {total}")
    print(f"Total Correct: {correct}")
    print(f"Total Wrong: {total - correct}")
    print(f"Accuracy: {accuracy:.2f}%")
    print(f"Elapsed Time: {end_time - start_time:.2f}s")
