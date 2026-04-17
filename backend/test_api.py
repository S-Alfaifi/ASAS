import sys
sys.path.append('c:\\Antigravity_Projects\\ASAS_V1\\backend')
import requests
from app import create_app
from flask_jwt_extended import create_access_token

app = create_app()
with app.app_context():
    access_token = create_access_token(identity=str(1))
    headers = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
    url = 'http://127.0.0.1:5000/api/admin/evaluate_model'
    print("Starting API call to evaluate_model (this takes about 5 seconds)...")
    response = requests.post(url, headers=headers)
    print(f'Status: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f"Accuracy: {data.get('accuracy')}%")
        print(f"Total Evaluated: {data.get('total_evaluated')}")
        print(f"Total Wrong: {data.get('wrong')}")
        print(f"Elapsed Seconds: {data.get('elapsed_seconds')}")
    else:
        print(response.text)
