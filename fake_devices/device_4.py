import requests, random, time

DEVICE = {
    "id": 4,
    "name": "Cảm biến nhiệt độ phòng khách",
    "device_token": "f053d8f9-7775-43c9-8911-81be65fedc3c",
    "metrics": {"temperature": (20,35), "humidity": (30,70)}
}
API_URL = "http://localhost:8000/telemetry/"

def generate_data(metrics):
    return {k: round(random.uniform(v[0], v[1]),2) for k,v in metrics.items()}

def send_telemetry():
    headers = {
        "x-device-token": DEVICE["device_token"],
        "Content-Type": "application/json"
    }
    while True:
        payload = {"data": generate_data(DEVICE["metrics"])}
        try:
            res = requests.post(API_URL, json=payload, headers=headers)
            print(f"[{DEVICE['name']}] Sent:", payload, "Status:", res.status_code)
        except Exception as e:
            print(e)
        time.sleep(3)

if __name__=="__main__":
    send_telemetry()