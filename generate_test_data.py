import pandas as pd
import random
from datetime import datetime, timedelta

positives = [
    "هذا المنتج رائع جدا وأنا سعيد بشرائه",
    "خدمة ممتازة وتجربة مذهلة حقا",
    "أعجبني كثيرا جودة الصنع العالية والتصميم الأنيق",
    "أفضل شيء اشتريته هذا العام، شكرا لكم",
    "سرعة في التوصيل واهتمام بالعميل، تجربة مثالية"
]

negatives = [
    "المنتج سيء جدا ولا يستحق هذا السعر",
    "تجربة مروعة وخدمة عملاء كارثية",
    "للأسف الجودة رديئة وتالف بعد يومين من الاستخدام",
    "لا أنصح به إطلاقا، ضياع للمال",
    "وصلني مكسور وتأخر في التسليم"
]

neutrals = [
    "وصل المنتج كما هو موضح في الوصف",
    "الجودة عادية وتتناسب مع السعر",
    "استلمت الطلب بالأمس وهو قيد التجربة حاليا",
    "اللون مختلف قليلا عن الصورة ولكن لا بأس",
    "منتج جيد ولكن متوفر بدائل أفضل بالسوق"
]

data = []
now = datetime.now()

for i in range(1000):
    val = random.random()
    if val < 0.33:
        text = random.choice(positives)
    elif val < 0.66:
        text = random.choice(negatives)
    else:
        text = random.choice(neutrals)
    
    # Random date within last 30 days
    days_back = random.uniform(0, 30)
    dt = now - timedelta(days=days_back)
    
    data.append({
        "Textual_Content_X92": text,
        "Timestamp_Observation": dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "Useless_Metric_A": random.randint(1, 100),
        "Bizarre_ID": f"ID-{random.randint(1000, 9999)}"
    })

df = pd.DataFrame(data)
df = df.sample(frac=1).reset_index(drop=True) # Shuffle rows
df.to_csv('test_model_performance.csv', index=False, encoding='utf-8-sig')
print("Generated test_model_performance.csv with 1000 rows.")
