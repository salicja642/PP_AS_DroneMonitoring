import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMapEvents } from "react-leaflet";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { 
  Button,
  Paper,
  Typography,
  Box,
  Stack,
  TextField,
  Input
} from "@mui/material";

import {
  PlayArrow,
  Stop,
  Edit as EditIcon,
  RocketLaunch,
  Delete as DeleteIcon
} from "@mui/icons-material";

//pomysł - dać wyszukiwarkę miast

const theme = createTheme({
  typography: {
    fontFamily: "Roboto, sans-serif", // Tutaj wpisujesz swoją czcionkę
  },
});

// Ikona drona
const droneIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
  iconSize: [32, 32],
  // 🆕 USTAW KOTWICĘ (Anchor): X=środek, Y=dół (32px)
  iconAnchor: [16, 32], 
  // 🆕 Ustaw Kotwicę Pop-up'a, aby wyskakiwał nad ikoną
  popupAnchor: [0, -32]
});

const pinIcon = L.icon({
  iconUrl: "https://icon-library.com/images/location-pin-icon/location-pin-icon-14.jpg",
  iconSize: [32, 32],
});

function Telemetry() {
  
  const commonButtonStyles = {
      padding:"10px 20px",
      color:"white",
      border:"none",
      marginRight:10,
      borderRadius:8,
      cursor: "pointer" // <--- KLUCZOWA ZMIANA
  };
  const btnGreen  = { padding:"10px 20px", ...commonButtonStyles, background:"green",       color:"white", border:"none", marginRight:10, borderRadius:8 };
  const btnRed    = { padding:"10px 20px", ...commonButtonStyles, background:"red",         color:"white", border:"none", marginRight:10, borderRadius:8 };
  const btnBlue   = { padding:"10px 20px", ...commonButtonStyles, background:"dodgerblue",  color:"white", border:"none", marginRight:10, borderRadius:8 };
  const btnOrange = { padding:"10px 20px", ...commonButtonStyles, background:"orange",      color:"white", border:"none", marginRight:10, borderRadius:8 };
  const btnGray   = { padding:"10px 20px", ...commonButtonStyles, background:"gray",        color:"white", border:"none", borderRadius:8 };
  const [data, setData] = useState({});
  const [route, setRoute] = useState([]);   // lista punktów trasy
  const [currentRoute, setCurrentRoute] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false); // czy rysujemy trasę
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const chartRefAltitude = useRef(null);  // 🆕 Dla wykresu Wysokości
  const chartInstanceAltitude = useRef(null);
  const [startPoint, setStartPoint] = useState(null);
  const fullRoute = data.latitude && data.longitude
    ? [
        { lat: data.latitude, lng: data.longitude, id: 'start' }, // Aktualna pozycja drona jako punkt początkowy
        ...route                                                // Zaznaczone punkty
      ]
    : route;
  const fullRoutewithStart = startPoint
    ? [
        startPoint,  // punkt początkowy
        ...route                                                // Zaznaczone punkty
      ]
    : route;
  const polylinePositions = fullRoutewithStart.map(p => [p.lat, p.lng]);

  const dynamicRoute = data.latitude && data.longitude
    ? [
        { lat: data.latitude, lng: data.longitude, id: 'start' }, // Aktualna pozycja drona
        ...currentRoute // 🆕 Używamy currentRoute zamiast route
      ]
    : currentRoute; // Jeśli brak danych, użyj samej listy

  const polylinePositionsDynamic = dynamicRoute.map(p => [p.lat, p.lng]);
  const [videoFrame, setVideoFrame] = useState(null);
  const isPausedRef = useRef(true);
  const isInMissionRef = useRef(false);

  // 1️⃣ Połączenie z backendem przez WebSocket

  useEffect(() => {
    isPausedRef.current = data.is_paused;
    isInMissionRef.current = data.is_in_mission;
  }, [data.is_paused, data.is_in_mission]);

  useEffect(() => {
    const socket = io("http://127.0.0.1:5000");
    socket.on("telemetry", (newData) => setData(newData));
    socket.on("video_frame", (frame) => {
      if (isPausedRef.current || !isInMissionRef.current) return;
      setVideoFrame(`data:image/jpeg;base64,${frame}`);
    });

    return () => {
      socket.off("telemetry");
      socket.off("video_frame");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // ----------------------------------------------------
    // WYKRES 1: PRĘDKOŚĆ (Speed)
    // ----------------------------------------------------
    if (chartInstance.current) chartInstance.current.destroy();
    if (chartRef.current) {
        const ctxSpeed = chartRef.current.getContext("2d");
        chartInstance.current = new Chart(ctxSpeed, {
            type: "line",
            data: {
                labels: Array.from({ length: 20 }, (_, i) => i),
                datasets: [
                    {
                        label: "Prędkość drona (m/s)",
                        data: Array(20).fill(0),
                        borderColor: "rgb(75, 192, 192)",
                        borderWidth: 2,
                        fill: false,
                    },
                ],
            },
            options: { animation: false, scales: { y: { beginAtZero: true } } },
        });
    }

    // ----------------------------------------------------
    // 🆕 WYKRES 2: WYSOKOŚĆ (Altitude)
    // ----------------------------------------------------
    if (chartInstanceAltitude.current) chartInstanceAltitude.current.destroy();
    if (chartRefAltitude.current) { // 🛑 Użycie drugiej referencji
        const ctxAltitude = chartRefAltitude.current.getContext("2d");
        chartInstanceAltitude.current = new Chart(ctxAltitude, { // 🛑 Inicjalizacja drugiej instancji
            type: "line",
            data: {
                labels: Array.from({ length: 20 }, (_, i) => i),
                datasets: [
                    {
                        label: "Wysokość drona (m)",
                        data: Array(20).fill(100),
                        borderColor: "rgb(255, 99, 132)",
                        borderWidth: 2,
                        fill: false,
                    },
                ],
            },
            options: { animation: false, scales: { y: { beginAtZero: true } } },
        });
    }
}, []);
  // 3️⃣ Aktualizacja wykresu

  useEffect(() => {
    if (typeof data.speed === "number" && chartInstance.current) {
      const speedChart = chartInstance.current;
      const speedData = speedChart.data.datasets[0].data;

      speedData.push(data.speed);
      if (speedData.length > 20) speedData.shift();

      speedChart.update();
    }

    if (typeof data.altitude === "number" && chartInstanceAltitude.current) {
      const altChart = chartInstanceAltitude.current;
      const altData = altChart.data.datasets[0].data;

      altData.push(data.altitude);
      if (altData.length > 20) altData.shift();

      altChart.update();
    }
  }, [data]);

  // 4️⃣ Start/Stop

  const handleControl = async (action) => {
    try {
      const res = await fetch(`/control/${action}`);
      const json = await res.json();
      console.log("Odpowiedź backendu:", json);
    } catch (err) {
      console.error("Błąd sterowania:", err);
    }
  };
const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    const roundedLat = Number(lat.toFixed(6));
    const roundedLng = Number(lng.toFixed(6));

    // DODAJEMY UNIKALNY ID (np. timestamp)
    setRoute((prev) => [...prev, {
        id: Date.now() + Math.random(), // Użycie timestamp + random to prosty unikalny ID
        lat: roundedLat,
        lng: roundedLng
    }]);
    console.log("Dodano punkt do trasy:", { lat: roundedLat, lng: roundedLng });
  };

  const saveStartPoint = () => {
    // Zapisz pozycję tylko, jeśli jeszcze jej nie mamy i są dostępne dane GPS
    if (data.latitude && data.longitude) {
      setStartPoint({ lat: data.latitude, lng: data.longitude, id: 'static_start' });
      console.log("Statyczny punkt startowy zapisany.");
    }
};

  const startMission = async () => {
    if (route.length < 1) {
      alert("Dodaj przynajmniej 1 punkt trasy!");
      return;
    }
    if (data.latitude && data.longitude) {
      setStartPoint({ lat: data.latitude, lng: data.longitude, id: 'static_start' });
    }

    await fetch("/start_mission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(route),
    });


  console.log("Misja rozpoczęta!");
};
// TA FUNKCJA MUSI WARUNKOWO WYWOŁYWAĆ handleMapClick
  function MapEventHandlers() { // Zmieniłem nazwę z MapClickHandler, aby uniknąć pomyłki z poprzednią wersją
    const map = useMapEvents({
      click: async (e) => {
        // Jeśli tryb rysowania jest aktywny, wywołujemy handleMapClick
        if (isDrawing) {
          handleMapClick(e); // <--- TUTAJ JEST WYWOŁANIE handleMapClick
          return; // Ważne: Zakończ, aby nie przechodzić do update_position
        }

        // Jeśli nie rysujemy trasy, a dron nie jest w misji (nowa flaga z backendu `data.is_in_mission`):
        // TO JEST NOWA LOGIKA ZMIANY POZYCJI Drona, KIEDY NIE JEST W MISJI
        // (musisz dodać `is_in_mission` do obiektu telemetry_data w backendzie)
        if (!data.is_in_mission) { // <- Warunek, jeśli backend wysyła `is_in_mission`
            const { lat, lng } = e.latlng;
            await fetch("/update_position", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lat, lng }),
            });
            console.log("Nowa pozycja drona:", lat, lng);
        }
      },
    });
    return null;
  }
  console.log("is_running:", data.is_running);
  console.log("is_in_mission:", data.is_in_mission);
  console.log("is_paused:", data.is_paused);

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* LEWA KOLUMNA */}
      <ThemeProvider theme={theme}>
      <Stack spacing = {2}>
        <Typography variant="h5" sx={{ mb: 2, fontSize: "20px", fontWeight: 500 }}>
            STEROWANIE
        </Typography>      
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          
          {/* Przyciski sterowania */}
          <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrow />}
              onClick={() => handleControl("start")}
              sx={{ mr: 2 }}
            >
              Start
            </Button>

            <Button
              variant="contained"
              color="error"
              startIcon={<Stop />}
              onClick={() => handleControl("stop")}
              sx={{ mr: 2 }}
            >
              Stop
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => {
                saveStartPoint();
                setIsDrawing(true);
              }}
              sx={{ mr: 2 }}
            >
              Rysuj trasę
            </Button>

            <Button
              variant="contained"
              color="warning"
              startIcon={<RocketLaunch />}
              onClick={startMission}
              sx={{ mr: 2 }}
            >
              Rozpocznij misję
            </Button>

            <Button
              variant="contained"
              color="inherit"
              startIcon={<DeleteIcon />}
              onClick={() => setRoute([])}
            >
              Wyczyść trasę
            </Button>

          </Stack>
          
        </Paper>
        <Typography variant="h5" sx={{ mb: 2, fontSize: "20px", fontWeight: 500 }}>
            TELEMETRIA DRONA
        </Typography>
        <Paper>          
          <Stack spacing = {2} sx={{ mt: 2, mb: 2, ml: 2, mr: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ width: 100 }}>Prędkość:</Typography>
              <Input
                value={data.speed ?? "—"}
                readOnly
                sx={{
                  border: "1px solid #4c5ef7",
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  width: 200,
                }}
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ width: 100 }}>Temperatura:</Typography>
              <Input
                value={data.temperature ?? "—"}
                readOnly
                sx={{
                  border: "1px solid #4c5ef7",
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  width: 200,
                }}
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ width: 100 }}>Wysokość:</Typography>
              <Input
                value={data.altitude ?? "—"}
                readOnly
                sx={{
                  border: "1px solid #4c5ef7",
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  width: 200,
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ width: 100 }}>Bateria:</Typography>
              <Input
                value={data.battery ?? "—"}
                readOnly
                sx={{
                  border: "1px solid #4c5ef7",
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  width: 200,
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ width: 100 }}>GPS:</Typography>
              <Input
                value={data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : "—"}
                readOnly
                sx={{
                  border: "1px solid #4c5ef7",
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  width: 200,
                }}
              />
            </Stack>
          </Stack>        
        </Paper>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 2,
            height: 200,
            bgcolor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {videoFrame ? (
            <img
              src={videoFrame}
              alt="Podgląd z kamery drona"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <Typography color="gray">Brak sygnału wideo</Typography>
          )}
        </Paper>
      </Stack>
      </ThemeProvider>
      {/* PRAWA KOLUMNA (MAPA) */}
      <ThemeProvider theme={theme}>
      <Box sx={{ flex: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: "20px", fontWeight: 500 }}>
          POZYCJA DRONA
        </Typography>     

        {data.latitude && data.longitude ? (
          <>
            <MapContainer
              center={[data.latitude, data.longitude]}
              zoom={14}
              style={{
                height: "500px",
                width: "100%",
                borderRadius: "10px",
                border: "1px solid #aaa",
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <MapEventHandlers />
              <Marker
                position={[data.latitude, data.longitude]}
                icon={droneIcon}
              >
                <Popup>
                  <b>Dron</b>
                  <br />
                  Lat: {data.latitude}
                  <br />
                  Lon: {data.longitude}
                </Popup>
              </Marker>
              {isDrawing && fullRoutewithStart.length > 1 && ( // Rysuj punkty trasy TYLKO w trybie rysowania
              <>
                {fullRoutewithStart.map((point, index) => (
                  <Marker key={point.id} position={[point.lat, point.lng]} icon={pinIcon}>
                    <Popup>Punkt {index + 1}</Popup>
                  </Marker>
                ))}
                <Polyline positions={polylinePositions} color="red" />
              </>
              )}
            </MapContainer>
            
          </>
        ) : (
          <p>Ładowanie lokalizacji…</p>
        )}
        <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
            <Paper elevation={3} sx={{ p: 2, flex: 1 }}>
              {chartRef && <canvas ref={chartRef} width="400" height="200" />}
            </Paper>

            <Paper elevation={3} sx={{ p: 2, flex: 1 }}>
              {chartRefAltitude && <canvas ref={chartRefAltitude} width="400" height="200" />}
            </Paper>
          </Stack>
      </Box>
      </ThemeProvider>
    </div>
  );
}


export default Telemetry;