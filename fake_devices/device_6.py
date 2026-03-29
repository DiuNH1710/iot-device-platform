import requests, random, time

DEVICE = {
    "id": 6,
    "name": "Tủ lạnh thông minh",
    "device_token": "b44357fe-0c5a-496e-acad-b0e043331910",
    "metrics": {"temperature": (-5,10), "door_open": (0,1), "power": (50,200)}
}
API_URL = "http://localhost:8000/telemetry/"

def generate_data(metrics):
    data = {}
    for k,(low,high) in metrics.items():
        if high-low > 1:
            data[k] = round(random.uniform(low,high),2)
        else:
            data[k] = random.randint(low,high)
    return data

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