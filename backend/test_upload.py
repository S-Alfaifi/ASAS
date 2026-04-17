import requests
import json
import pandas as pd
from io import StringIO
import time

def test_upload():
    print("Log in to get token...")
    # guest login
    res = requests.post("http://localhost:5000/api/auth/guest", json={})
    if res.status_code not in (200, 201):
        print("Failed to login:", res.text)
        return
        
    token = res.json().get('token')
    print("Token:", token)
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create dummy csv
    csv_data = "text\nمرحبا هذا اختبار\nهذا جيد جدا\nسيء للغاية"
    files = {'file': ('test.csv', StringIO(csv_data), 'text/csv')}
    print("Uploading file...")
    upload_res = requests.post("http://localhost:5000/api/analyze/file", headers=headers, files=files)
    
    if upload_res.status_code != 202:
        print("Upload failed:", upload_res.text)
        return
        
    job_id = upload_res.json().get("job_id")
    print("Upload returned job_id:", job_id)
    
    while True:
        status_res = requests.get(f"http://localhost:5000/api/analyze/file/status/{job_id}", headers=headers)
        if status_res.status_code != 200:
            print("Status fetch failed:", status_res.text)
            break
        
        job_data = status_res.json()
        print("Status:", job_data.get('status'), "Progress:", job_data.get('progress'))
        
        if job_data.get('status') in ('completed', 'failed'):
            print("Final data:", job_data)
            break
            
        time.sleep(1)

if __name__ == "__main__":
    test_upload()
