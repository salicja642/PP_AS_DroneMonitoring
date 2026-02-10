# Drone Monitoring & Diagnostic System

Aplikacja webowa służąca do monitorowania, diagnostyki oraz planowania misji jednostek bezzałogowych w czasie rzeczywistym.

**Adres aplikacji:** [https://drone-frontend-nujm.onrender.com](https://drone-frontend-nujm.onrender.com)

## Główne Funkcjonalności

- **Telemetria Live:** Monitorowanie wysokości, prędkości, temperatury i stanu baterii przez WebSockets.
- **Planowanie Misji:** Interaktywna mapa (Leaflet.js) umożliwiająca rysowanie tras i automatyczny przelot drona.
- **Streaming FPV:** Podgląd wideo z kamery drona (MJPEG) wraz z dynamicznym dźwiękiem silnika.
- **Profile Dronów:** Trzy klasy jednostek (Scout-X, Standard, Heavy-Lift) o różnej fizyce lotu i zużyciu energii.
- **Archiwizacja:** Zapis i odczyt tras misji z trwałej bazy danych SQLite.
- **Wykresy Real-time:** Analiza trendów prędkości i wysokości z ostatnich 20 sekund.

## Stos Technologiczny

### Frontend
- **React.js** (Zarządzanie stanem i interfejsem)
- **Material UI** (Responsywny Dashboard)
- **Leaflet.js** (Obsługa map i GPS)
- **Chart.js** (Wykresy dynamiczne)
- **Socket.io-client** (Komunikacja dwukierunkowa)

### Backend
- **Flask** (Serwer API i logika symulacji)
- **Flask-SocketIO** (Streaming telemetrii)
- **OpenCV** (Przetwarzanie obrazu i OSD)
- **SQLite** (Baza danych misji)
- **Gevent** (Obsługa asynchroniczna)

### Infrastruktura
- **Docker** (Konteneryzacja)
- **Render** (Hosting i CI/CD)
- **GitHub** (System kontroli wersji)

## Architektura Systemu

System pracuje w architekturze klient-serwer:
1. **Backend:** Symulator drona wylicza fizykę lotu i przesyła dane trzema kanałami: WebSocket (telemetria), HTTP Stream (wideo) oraz REST API (komendy/baza).
2. **Frontend:** Modułowa struktura React odbiera dane i wizualizuje je w wyspecjalizowanych panelach kontrolnych.



## Uruchomienie Lokalne

### 1. Klonowanie repozytorium
```bash
git clone [https://github.com/salicja642/PP_AS_DroneMonitoring.git](https://github.com/salicja642/PP_AS_DroneMonitoring.git)
cd PP_AS_DroneMonitoring
```
### 2. Konfiguracja Backendu
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/MacOS:
source venv/bin/activate
pip install -r requirements.txt
python app.py
```
### 3. Konfiguracja Frontendu
```bash
cd frontend
npm install
npm start
```

Dane do logowania: Login - admin, Hasło - admin123
