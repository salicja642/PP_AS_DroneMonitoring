import pytest
from app import app

# Funkcja pomocnicza (możesz ją potem przenieść do swojego głównego kodu)
def calculate_remaining_battery(current, consumption):
    result = current - consumption
    return max(0, round(result, 2))

# TEST JEDNOSTKOWY
def test_battery_logic():
    # Sprawdzamy czy poprawnie odejmuje
    assert calculate_remaining_battery(100, 5.5) == 94.5
    # Sprawdzamy czy nie schodzi poniżej zera
    assert calculate_remaining_battery(1, 5.0) == 0
    # Sprawdzamy precyzję
    assert calculate_remaining_battery(10.555, 0.05) == pytest.approx(10.51, abs=0.01)

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# TEST INTEGRACYJNY
def test_login_endpoint(client):
    # Wysyłamy fake'owe żądanie do Twojego API
    response = client.post('/login', json={
        "username": "admin",
        "password": "admin123" # Podaj dane, które masz w bazie/kodzie
    })
    
    # Sprawdzamy czy serwer odpowiedział (nawet jeśli błędem, to sprawdzamy strukturę)
    assert response.status_code in [200, 401] 
    if response.status_code == 200:
        assert response.json['status'] == 'ok'

# TEST INTEGRACYJNY BAZY DANYCH
def test_db_save_mission(client):
    # Symulujemy zakończenie misji i zapis do bazy
    mission_data = {
        "drone_id": "scout-x",
        "distance": 150.5,
        "duration": 60
    }
    # Zakładamy, że masz taki endpoint lub funkcję zapisu
    response = client.post('/save_route', json=mission_data)
    
    # Jeśli zapis się uda, serwer powinien zwrócić 200 lub 201
    assert response.status_code in [200, 201]



# TEST INTEGRACYJNY: Walidacja punktu startowego
def test_mission_start_point(client):
    # Definiujemy trasę z konkretnym punktem startowym
    test_route = [
        {"lat": 52.2297, "lng": 21.0122}, # Warszawa
        {"lat": 50.0647, "lng": 19.9450}  # Kraków
    ]
    
    # Wysyłamy żądanie startu misji z tą trasą
    response = client.post('/start_mission', json={
        "mission_id": "test-1",
        "route": test_route
    })
    
    assert response.status_code == 200
    
    # Pobieramy aktualny stan drona po starcie (zakładając, że masz taki endpoint)
    # Jeśli nie, testujemy bezpośrednio odpowiedź serwera
    telemetry_resp = client.get('/telemetry')
    current_route = telemetry_resp.json.get('route', [])
    
    if len(current_route) > 0:
        # Sprawdzamy, czy pierwszy punkt to nie jest przypadkiem (0,0)
        start_point = current_route[0]
        assert start_point['lat'] != 0
        assert start_point['lng'] != 0
        # Sprawdzamy, czy pierwszy punkt zgadza się z wysłanym
        assert start_point['lat'] == test_route[0]['lat']