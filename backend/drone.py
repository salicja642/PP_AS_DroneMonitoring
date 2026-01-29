import random
import threading

class Drone:
    def __init__(self):
        self._lock = threading.Lock()

        # Stan drona
        self.altitude = 100
        self.speed = 0.0 
        self.temperature = 40
        self.battery = 100
        self.latitude = round(random.uniform(52.2, 52.3), 6)
        self.longitude = round(random.uniform(21.0, 21.1), 6)
        self.drain_rate = 0.02  
        self.speed_multiplier = 1.0
        self.max_speed_range = (10.0, 14.0)
        
        # Flagi kontrolne
        self.is_running = True
        self.is_in_mission = False
        self.is_paused = False
        self.mission_route = []
        self.mission_current_route = []
        self.current_mission_id = 0

    def set_profile(self, model_id):
        """Ustawia parametry drona na podstawie wybranego modelu"""
        with self._lock:
            self.model_id = model_id
            if model_id == "scout-x":
                self.drain_rate = 0.05      # Szybki drenaż baterii
                self.speed_multiplier = 2.5  # Bardzo szybki
                self.max_speed_range = (18.0, 25.0)                
            elif model_id == "heavy-lift":
                self.drain_rate = 0.01      # Bardzo oszczędny
                self.speed_multiplier = 0.5  # Wolny i ociężały
                self.max_speed_range = (4.0, 14.0)
            else:  # profil standardowy
                self.drain_rate = 0.02
                self.speed_multiplier = 1.0
                self.max_speed_range = (10.0, 14.0)
    
    def get_telemetry(self):
        """Zwraca kopię danych do wysłania do frontendu"""
        with self._lock:
            model_names = {
                "scout-x": "SCOUT-X (ZWIAD)",
                "heavy-lift": "HEAVY-LIFT (TRANSPORT)",
                "standard": "STANDARD (BALANS)"
            }
            # Pobieramy nazwę na podstawie zapisanego id (domyślnie 'standard')
            active_name = model_names.get(getattr(self, 'model_id', 'standard'), "PROFIL ZAŁADOWANY")
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
                "route_points": self.mission_current_route,
                "drone_model_name": active_name,
            }
        
    def update_position(self, lat, lng):
        """Aktualizacja pozycji"""
        with self._lock:
            self.latitude = round(lat, 6)
            self.longitude = round(lng, 6)

    def apply_battery_drain(self, amount):
        """Zmniejsza poziom baterii"""
        with self._lock:
            self.battery = max(0, self.battery - amount)