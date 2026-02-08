from flask import Flask, jsonify, request, send_from_directory
from flask_socketio import SocketIO
import threading
import time
import sqlite3
from drone import Drone
import simulator
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
socketio = SocketIO(
    app, 
    cors_allowed_origins="*", 
    async_mode='gevent',
    ping_timeout=60,          
    ping_interval=25, 
    logger=True, 
    engineio_logger=True
)

drone = Drone()

#logowanie
users = {"admin": "admin123", "student": "test123"}

#baza danych
def init_db():
    conn = sqlite3.connect('drone_missions.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS history 
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT,                 
                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, 
                  route_json TEXT)''')
    conn.commit()
    conn.close()

init_db()


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    if username in users and users[username] == password:
        return jsonify({"status": "ok"})
    else:
        return jsonify({"status": "error"}), 401

@app.route("/start_mission", methods=["POST"])
def start_mission():
    new_mission_id = int(time.time() * 1000)
    drone.current_mission_id = new_mission_id
    
    data = request.get_json()
    route = data if isinstance(data, list) else data.get("route", [])
    drone.mission_route = route
    drone.is_in_mission = True
    drone.is_paused = False
    
    threading.Thread(
        target=simulator.simulate_flight, 
        args=(drone, socketio, new_mission_id), 
        daemon=True
    ).start()
    
    print(f"DEBUG: Started Mission ID {new_mission_id}")
    return jsonify({"status": "mission_started", "mission_id": new_mission_id})

@app.route("/select_drone/<model_id>")
def select_drone(model_id):
    drone.set_profile(model_id)
    print(f"SYSTEM: Wybrano profil przez URL: {model_id}")
    return jsonify({"status": "selected", "model": model_id})

@app.route("/telemetry")
def telemetry():
    return jsonify(drone.get_telemetry())


@app.route("/audio")
def audio():
    return send_from_directory(".", "drone_engine_audio.wav", mimetype="audio/wav")


@app.route("/control/<action>")
def control(action):
    is_mission_active = drone.is_in_mission
    is_currently_paused = drone.is_paused
    
    if action == "start":
        if is_mission_active and is_currently_paused:
            drone.is_paused = False
            drone.is_running = True
            print("MISJA: Wznowiono.")
        else: 
            drone.is_running = True
            drone.is_in_mission = True
            drone.is_paused = False
            print("MISJA: Rozpoczęto.")

    elif action == "stop": 
        if is_mission_active:
            drone.is_paused = True
            print("MISJA: Wstrzymano (Pauza).")
        else: 
            drone.is_running = False
            drone.is_in_mission = False
            print("MISJA: Twardy stop symulacji.")

    return jsonify({
        "status": "ok", 
        "running": drone.is_running,
        "is_paused": drone.is_paused
    })

@app.route("/update_position", methods=["POST"])
def update_position():
    data = request.get_json()
    lat = data.get("lat", drone.latitude)
    lng = data.get("lng", drone.longitude)
    drone.update_position(lat, lng)

    return jsonify({"status": "ok", "new_position": drone.get_telemetry()})

@app.route("/save_route", methods=["POST"])
def save_route():
    data = request.get_json()
    name = data.get("name", "Bez nazwy")
    route = data.get("route", [])
    
    try:
        conn = sqlite3.connect('drone_missions.db')
        c = conn.cursor()
        c.execute("INSERT INTO history (name, route_json) VALUES (?, ?)", 
                  (name, json.dumps(route)))
        conn.commit()
        conn.close()
        print("Zapisano w bazie")
        return jsonify({"status": "ok", "message": "Trasa zapisana poprawnie!"})
    except Exception as e:
        print(f"!!! BŁĄD BAZY: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/get_history", methods=["GET"])
def get_history():
    search = request.args.get('search', '') 
    try:
        conn = sqlite3.connect('drone_missions.db')
        c = conn.cursor()
        
        if search:
            
            c.execute("SELECT id, name, timestamp, route_json FROM history WHERE name LIKE ? ORDER BY timestamp DESC", 
                      (f'%{search}%',))
        else:
            c.execute("SELECT id, name, timestamp, route_json FROM history ORDER BY timestamp DESC")
            
        rows = c.fetchall()
        conn.close()
        
        history = [
            {"id": r[0], "name": r[1], "date": r[2], "route": json.loads(r[3])} 
            for r in rows
        ]
        return jsonify(history)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    threading.Thread(target=simulator.simulate_drone, args=(drone, socketio), daemon=True).start()
    threading.Thread(target=simulator.telemetry_loop, args=(drone, socketio), daemon=True).start()
    threading.Thread(target=simulator.video_stream, args=(socketio,drone), daemon=True).start()

    socketio.run(app, debug=True)