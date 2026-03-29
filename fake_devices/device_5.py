import requests, random, time

DEVICE = {
    "id": 5,
    "name": "Ổ cắm thông minh phòng bếp",
    "device_token": "f56be082-a7df-4e9b-9677-1df88d0a9cab",
    "metrics": {"voltage": (210,230), "current": (0.5,2.0), "power": (0,5000)}
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