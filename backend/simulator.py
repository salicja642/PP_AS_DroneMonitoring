import cv2
import base64
import wave
from utils import reached_target, distance
import random
import time
import os
import numpy as np

def simulate_drone(drone, socketio):
    """Pętla czuwania: obsługuje zużycie baterii, gdy dron nie jest w misji."""
    while True:
        if drone.is_running and not drone.is_in_mission:
            drone.apply_battery_drain(0.005)
            drone.speed = 0.0
        
        elif not drone.is_running:
            drone.speed = 0.0
            
        socketio.sleep(1)


def telemetry_loop(drone, socketio):
    """Stała pętla wysyłająca stan drona"""
    while True:
        socketio.emit("telemetry", drone.get_telemetry())
        socketio.sleep(1)


def video_stream(socketio, drone):
    cap = None  
    video_path = os.path.join(os.path.dirname(__file__), "drone_video.mp4")

    while True:
        if drone.is_in_mission and not drone.is_paused:
            if cap is None or not cap.isOpened():
                print(f"SYSTEM: Otwieranie pliku wideo: {video_path}")
                cap = cv2.VideoCapture(video_path)

            ret, frame = cap.read()
            
            if ret:                
                frame = cv2.resize(frame, (480, 270)) 
                cv2.putText(frame, "SIMULATED FEED", (10, 25), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

                _, buffer = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
                frame_base64 = base64.b64encode(buffer).decode("utf-8")
                
                socketio.emit("video_frame", f"data:image/jpeg;base64,{frame_base64}")
            else:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        
        else:
            if cap is not None:
                cap.release()
                cap = None
                socketio.emit("video_frame", None)

        socketio.sleep(0.1)


def generate_frames(drone):
    video_path = os.path.join(os.path.dirname(__file__), "drone_video.mp4")
    cap = cv2.VideoCapture(video_path)
    
    while True:
        if drone.is_in_mission and not drone.is_paused:
            ret, frame = cap.read()
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
                
            frame = cv2.resize(frame, (480, 270))
        else:
            # Tworzymy czarną klatkę, gdy misja nie trwa (zamiast tylko spać)
            # To zapobiega błędowi 500, bo strumień cały czas coś wysyła
            frame = np.zeros((270, 480, 3), dtype=np.uint8)
            cv2.putText(frame, "WAITING FOR MISSION...", (100, 135), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            time.sleep(0.5) # Oszczędzamy procesor w trybie czuwania

        # Kodowanie klatki do formatu JPEG
        ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
        if not ret:
            continue
            
        frame_bytes = buffer.tobytes()
        
        # Kluczowy format MJPEG
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
'''
def audio_stream(socketio):
    """Strumieniowanie dźwięku silnika drona."""
    try:
        wf = wave.open("drone_engine_audio.wav", "rb")  
        chunk_size = 1024                    
        while True:
            chunk = wf.readframes(chunk_size)
            if len(chunk) == 0:
                wf.rewind()                 
                continue
            socketio.emit("audio_chunk", chunk)
            socketio.sleep(0.05)  
    except FileNotFoundError:
        print("Audio file not found, skipping audio stream.")

def audio_stream(socketio):
    """Informuje frontend o stanie dźwięku silnika."""
    while True:
        # Jeśli dron pracuje, wysyłaj sygnał "graj"
        socketio.emit("engine_state", {"playing": True})
        socketio.sleep(2)
'''

def simulate_flight(drone, socketio, mission_id):
    """Logika aktywnej misji drona po wyznaczonych punktach."""
    drone.mission_current_route = list(drone.mission_route)
    print("MISSION: start flight route.")

    while drone.is_in_mission and drone.mission_current_route:
        if drone.current_mission_id != mission_id:
            print(f"MISSION {mission_id}: Detected new mission. Terminating old thread.")
            return
        
        while drone.is_paused:
            drone.speed = 0.0
            socketio.emit("telemetry", drone.get_telemetry()) 
            socketio.sleep(0.5) 
            if not drone.is_in_mission:
                return 

        wp = drone.mission_current_route[0] 
        print("MISSION: flying to", wp)

        while drone.is_in_mission and not reached_target(drone.latitude, drone.longitude, wp["lat"], wp["lng"]):
            if drone.is_paused:
                print("MISSION: Flight paused mid-segment.")
                break
            with drone._lock:
                move_divisor = 50 / drone.speed_multiplier
                drone.latitude += (wp["lat"] - drone.latitude) / move_divisor
                drone.longitude += (wp["lng"] - drone.longitude) / move_divisor
                min_s, max_s = drone.max_speed_range
                drone.speed = round(random.uniform(5, 12), 2)
                drone.altitude = round(random.uniform(min_s, max_s), 2)
                drone.battery = max(0, drone.battery - drone.drain_rate)
            
            socketio.emit("telemetry", drone.get_telemetry())
            socketio.sleep(0.1)     

        if drone.is_paused:
            continue

        if reached_target(drone.latitude, drone.longitude, wp["lat"], wp["lng"]):
            with drone._lock:
                if drone.mission_current_route:
                    drone.latitude = wp['lat']
                    drone.longitude = wp["lng"]
                    drone.speed = 0.0
                    drone.mission_current_route.pop(0)

            socketio.emit("telemetry", drone.get_telemetry())
            print(f"MISSION: reached waypoint. Remaining: {len(drone.mission_current_route)}")
            socketio.sleep(1)
        
    print("MISSION COMPLETE.")
    with drone._lock:
        drone.is_in_mission = False
        drone.speed = 0.0
        drone.mission_route = []
    socketio.emit("telemetry", drone.get_telemetry())