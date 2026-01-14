from flask import Flask, jsonify, request, send_file
from flask_socketio import SocketIO
import threading

# Importujemy nasze nowe moduły
from drone import Drone
import simulator


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

drone = Drone()

#logowanie
users = {"admin": "admin123", "student": "test123"}

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
    route = request.get_json()
    drone.mission_route = route
    drone.is_in_mission = True
    drone.is_paused = False
    
    threading.Thread(target=simulator.simulate_flight, args=(drone, socketio), daemon=True).start()
    return jsonify({"status": "mission_started"})


@app.route("/telemetry")
def telemetry():
    return jsonify(drone.get_telemetry())


@app.route("/audio")
def audio():
    return send_file("drone_engine_audio.wav", mimetype="audio/wav")


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
            drone.is_runing = False
            drone.is_in_missin = False
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

if __name__ == "__main__":
    threading.Thread(target=simulator.simulate_drone, args=(drone, socketio), daemon=True).start()
    threading.Thread(target=simulator.telemetry_loop, args=(drone, socketio), daemon=True).start()
    threading.Thread(target=simulator.audio_stream, args=(socketio,), daemon=True).start()
    threading.Thread(target=simulator.video_stream, args=(socketio,), daemon=True).start()

    socketio.run(app, debug=True)