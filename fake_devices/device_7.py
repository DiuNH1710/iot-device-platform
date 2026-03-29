import requests, random, time

DEVICE = {
    "id": 7,
    "name": "Máy đo chất lượng không khí phòng ngủ",
    "device_token": "37a82bb2-fde9-4549-8d59-aced78880fe4", 
    "metrics": {"pm2_5": (0,150), "pm10": (0,200), "co2": (400,2000), "voc": (0,500)}
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