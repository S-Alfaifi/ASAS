import pandas as pd
import random
import os

positives = [
    "منتج رائع جدا", "شحن سريع وتغليف ممتاز", "أفضل شراء قمت به", 
    "الجودة مذهلة", "سعيد جدا بالخدمة", "أوصي به الجميع بشدة",
    "تجربة استثنائية", "سعر ممتاز مقابل الجودة", "أحببته كثيرا", "خدمة عملاء راقية"
]

negatives = [
    "سيء للغاية لا أنصح به", "تعطل بعد يومين", "خدمة عملاء بطيئة جدا",
    "تأخر الشحن كثيرا", "جودة رديئة وتصنيع سيء", "أسوأ تجربة شراء",
    "المنتج تالف", "غير مطابق للموصفات", "مضيعة للمال", "لا يعمل بشكل صحيح"
]

neutrals = [
    "المنتج عادي جدا", "السعر مناسب لكن الجودة متوسطة", "وصل الطلب",
    "لون مختلف قليلا", "لا بأس به", "يحتاج بعض التحسينات",
    "يعمل كما هو متوقع", "حجمه أصغر من المتوقع لكنه مقبول", "شحن عادي", "تصميم تقليدي"
]

data = []

# Exactly 333 of each
for _ in range(333):
    data.append({"Text": random.choice(positives), "True_Label": "positive"})
    data.append({"Text": random.choice(negatives), "True_Label": "negative"})
    data.append({"Text": random.choice(neutrals), "True_Label": "neutral"})

random.shuffle(data)

df = pd.DataFrame(data)
# Save it in the backend folder so it can be easily read by the admin endpoint without needing an upload
file_path = os.path.join(os.path.dirname(__file__), 'backend', 'model_performance_golden.csv')
df.to_csv(file_path, index=False, encoding='utf-8-sig')

print(f"Generated {file_path} with 999 rows.")
