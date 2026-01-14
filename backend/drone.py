import random
import threading

class Drone:
    def __init__(self):
        # Zapobieganie konfliktom
        self._lock = threading.Lock()

        # Stan drona
        self.altitude = 100
        self.speed = 0.0 # 10
        self.temperature = 40
        self.battery = 100
        self.latitude = round(random.uniform(52.2, 52.3), 6)
        self.longitude = round(random.uniform(21.0, 21.1), 6)
        
        # Flagi kontrolne
        self.is_running = True
        self.is_in_mission = False
        self.is_paused = False
        self.mission_route = []
        self.mission_current_route = []

    def get_telemetry(self):
        """Zwraca kopię danych do wysłania do frontendu"""
        with self._lock:
            return {
                "altitude": self.altitude,
                "speed": self.speed,
                "temperature": self.temperature,
                "battery": round(self.battery, 1),
                "latitude": self.latitude,
                "longitude": self.longitude,
                "is_in_mission": self.is_in_mission,
                "is_paused": self.is_paused,
                "is_running": self.is_running,
                "route_points": self.mission_current_route
            }
        
    def update_position(self, lat, lng):
        """Bezpieczna aktualizacja pozycji."""
        with self._lock:
            self.latitude = round(lat, 6)
            self.longitude = round(lng, 6)

    def apply_battery_drain(self, amount):
        """Zmniejsza poziom baterii, dbając o to, by nie spadł poniżej 0."""
        with self._lock:
            self.battery = max(0, self.battery - amount)