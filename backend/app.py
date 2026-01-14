from flask import Flask, jsonify
import random, threading, time
from flask_socketio import SocketIO, emit
import wave
from flask import send_file
from flask import request
import math
import cv2
import base64


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

#logowanie
users = {
    "admin": "admin123",
    "student": "test123"
}

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if username in users and users[username] == password:
        return jsonify({"status": "ok"})
    else:
        return jsonify({"status": "error"}), 401

# Dane początkowe
telemetry_data = {
    "altitude": 100,
    "speed": 10,
    "temperature": 40,
    "battery": 100,
    "latitude": round(random.uniform(52.2, 52.3), 6),
    "longitude": round(random.uniform(21.0, 21.1), 6),
    "is_in_mission": False,
    "is_paused": False
}

is_running = True  # flaga start/stop
is_in_mission = False
mission_route = []
mission_current_route = []

# Funkcja symulująca lot drona

def simulate_drone():
    global telemetry_data, is_running
    while True:
        # Pętla aktualnie zajmuje się:
        # 1. Zmianą parametrów, gdy nie jest w misji (zastąpione przez "brak zmian")
        # 2. Ciągłym zużyciem baterii (pozostawiamy)
   
        if is_running and not telemetry_data["is_in_mission"]: # Dron włączony, ale czeka (nie w misji)
            # Utrzymuj stałe parametry, symuluj jedynie minimalne zużycie baterii
            telemetry_data["battery"] = max(0, telemetry_data["battery"] - 0.005) # Mniejsze zużycie
            telemetry_data["battery"] = round(telemetry_data["battery"], 1)
            telemetry_data["speed"] = 0.0 # Zerowa prędkość        
            # W tym stanie nie ma losowego ruchu
      
        elif not is_running:
            # Dron jest wyłączony
            telemetry_data["speed"] = 0.0
            telemetry_data["battery"] = round(telemetry_data["battery"], 1) # Bateria stała/bardzo wolny spadek (opcjonalnie)     

        # WAŻNE: W tym trybie (poza misją) nie ruszamy położenia drona (latitude/longitude)       

        time.sleep(1) # Czeka JEDNĄ sekundę


def telemetry_loop():
    while True:
        socketio.emit("telemetry", telemetry_data)
        socketio.sleep(1)

def audio_stream():
    wf = wave.open("drone_engine_audio.wav", "rb")   # ← plik WAV w folderze backend
    chunk_size = 1024                    # paczka 1024 bajty
    while True:
        chunk = wf.readframes(chunk_size)
        if len(chunk) == 0:
            wf.rewind()                  # zapętlenie
            continue

        socketio.emit("audio_chunk", chunk)
        socketio.sleep(0.05)  # ~50ms

#video stream
def video_stream():
    cap = cv2.VideoCapture("drone_video.mp4")  # film symulujący kamerkę

    while True:
        ret, frame = cap.read()
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        # zmniejszenie rozdzielczości (ważne!)
        frame = cv2.resize(frame, (640, 360))

        _, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
        frame_base64 = base64.b64encode(buffer).decode("utf-8")

        socketio.emit("video_frame", frame_base64)
        socketio.sleep(0.05)  # ~20 FPS


#misja drona
def distance(lat1, lon1, lat2, lon2):
    """Odległość w metrach między dwoma punktami"""
    R = 6371000
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2)**2 +
         math.cos(math.radians(lat1))*math.cos(math.radians(lat2))*math.sin(dlon/2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def reached(target, threshold=4):
    """Czy dron dotarł do punktu (3 metry dokładności)?"""
    return distance(
        telemetry_data["latitude"],
        telemetry_data["longitude"],
        target["lat"],
        target["lng"],
    ) < threshold


def simulate_flight():
    global telemetry_data, mission_route, mission_current_route
    mission_current_route = list(mission_route)

    print("MISSION: start flight route.")


    while telemetry_data["is_in_mission"] and mission_current_route:
        
        # 2. ✅ BLOKADA PAUZY (na początku segmentu)
        while telemetry_data["is_paused"]:
            telemetry_data["speed"] = 0.0
            telemetry_data["route_points"] = mission_current_route # Wyślij, że misja jest spauzowana
            socketio.emit("telemetry", telemetry_data) 
            socketio.sleep(0.5) 
            
            if not telemetry_data["is_in_mission"]:
                return # Wyjdź, jeśli misja została anulowana w trakcie pauzy

        # Aktualny punkt docelowy to ZAWSZE pierwszy element listy
        wp = mission_current_route[0] 
        print("MISSION: flying to", wp)

        while telemetry_data["is_in_mission"] and not reached(wp):
            if telemetry_data["is_paused"]:
                print("MISSION: Flight paused mid-segment.")
                break
            lat = telemetry_data["latitude"]
            lng = telemetry_data["longitude"]
            # mały krok ruchu do punktu
            step_lat = (wp["lat"] - lat) / 50
            step_lng = (wp["lng"] - lng) / 50
            print(step_lat, step_lng)
            telemetry_data["latitude"] = round(lat + step_lat, 6)
            telemetry_data["longitude"] = round(lng + step_lng, 6)

            # symulacja parametrów w trakcie lotu
            telemetry_data["speed"] = round(random.uniform(5, 12), 2)
            telemetry_data["altitude"] = round(random.uniform(90, 110), 2)
            telemetry_data["battery"] = round(max(0, telemetry_data["battery"] - 0.02), 2)
            telemetry_data["route_points"] = mission_current_route
            socketio.emit("telemetry", telemetry_data)
            socketio.sleep(0.1)  # płynność aktualizacji     

        if telemetry_data["is_paused"]:
            continue

        if reached(wp):
            telemetry_data["latitude"] = wp["lat"]
            telemetry_data["longitude"] = wp["lng"]
            telemetry_data["speed"] = 0.0

            socketio.emit("telemetry", telemetry_data)
            mission_current_route.pop(0) 

        if not telemetry_data["is_in_mission"]:
            print("MISSION: Aborted by stop command while flying.")
            return
   
        
        telemetry_data["route_points"] = mission_current_route
        socketio.emit("telemetry", telemetry_data)

        print(f"MISSION: reached waypoint (lat: {wp['lat']}, lon: {wp['lng']}). Pausing for 2 seconds.")
        socketio.sleep(2)

        
    print("MISSION COMPLETE.")
    telemetry_data["is_in_mission"] = False
    telemetry_data["is_in_mission"] = False
    telemetry_data["speed"] = 0.0
    telemetry_data["route_points"] = []
    socketio.emit("telemetry", telemetry_data)

@app.route("/start_mission", methods=["POST"])
def start_mission():
    global mission_route, is_in_mission, telemetry_data
    mission_route = request.get_json()
    telemetry_data["is_in_mission"] = True
    telemetry_data["is_paused"] = False
    print("Received mission route:", mission_route)
    threading.Thread(target=simulate_flight, daemon=True).start()
    return jsonify({"status": "mission_started"})


@app.route("/telemetry")
def telemetry():
    return jsonify(telemetry_data)


@app.route("/audio")
def audio():
    return send_file("drone_engine_audio.wav", mimetype="audio/wav")

# Włączanie / wyłączanie symulacji
'''
@app.route("/control/<action>")
def control(action):
    global is_running
    global is_in_mission
    if action == "start":
        is_running = True
        telemetry_data["is_in_mission"] = True
        telemetry_data["is_paused"] = False
    elif action == "stop":
        is_running = False
        telemetry_data["is_paused"] = True
        #telemetry_data["is_in_mission"] = False
    return jsonify({"status": "ok", "running": telemetry_data["is_running"],
        "is_paused": telemetry_data.get("is_paused", False)})
#aktualizacja współrzędnych
'''
@app.route("/control/<action>")
def control(action):
    global telemetry_data
    # Usuwamy global is_running i is_in_mission na rzecz telemetry_data
    
    # Użyjemy .get() dla bezpieczeństwa
    is_mission_active = telemetry_data.get("is_in_mission", False)
    is_currently_paused = telemetry_data.get("is_paused", False)
    
    if action == "start":
        
        # 1. 🔄 WZNOWIENIE (Jeśli misja jest aktywna, ale spauzowana)
        if is_mission_active and is_currently_paused:
            telemetry_data["is_paused"] = False
            telemetry_data["is_running"] = True # Zezwól na ogólne działanie
            print("MISJA: Wznowiono.")
        
        # 2. ▶️ PIERWSZY START (Jeśli misja nie jest jeszcze aktywna)
        else: 
            telemetry_data["is_running"] = True
            telemetry_data["is_in_mission"] = True # Rozpocznij misję
            telemetry_data["is_paused"] = False
            print("MISJA: Rozpoczęto.")

    elif action == "stop":
        
        # 1. ⏸ PAUZA (Jeśli misja jest aktywna)
        if is_mission_active:
            telemetry_data["is_paused"] = True
            telemetry_data["is_running"] = True # Symulacja działa (ale lot jest zatrzymany)
            print("MISJA: Wstrzymano (Pauza).")
        
        # 2. 🛑 ZATRZYMANIE (Jeśli dron był tylko w trybie oczekiwania)
        else: 
            telemetry_data["is_running"] = False
            telemetry_data["is_in_mission"] = False
            print("MISJA: Twardy stop symulacji.")

    # Zwróć zaktualizowany stan
    return jsonify({
        "status": "ok", 
        "running": telemetry_data["is_running"],
        "is_paused": telemetry_data.get("is_paused", False)
    })

@app.route("/update_position", methods=["POST"])
def update_position():
    global telemetry_data
    data = request.get_json()
    lat = data.get("lat", telemetry_data["latitude"])
    lng = data.get("lng", telemetry_data["longitude"])

    telemetry_data["latitude"] = round(lat, 6)
    telemetry_data["longitude"] = round(lng, 6) 

    return jsonify({"status": "ok", "new_position": telemetry_data})



if __name__ == "__main__":
    threading.Thread(target=simulate_drone, daemon=True).start()
    threading.Thread(target=telemetry_loop, daemon=True).start()
    threading.Thread(target=audio_stream, daemon=True).start()
    threading.Thread(target=video_stream, daemon=True).start()
    socketio.run(app, debug=True)


'''
<canvas
            ref={chartRef}
            width="400"
            height="200"
            style={{ marginTop: 20 }}
          ></canvas>
          <canvas
            ref={chartRefAltitude} // 🆕 Używamy nowej referencji
            width="400"
            height="200"
            style={{ marginTop: 20 }}
          ></canvas>
'''