import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useMapEvents } from "react-leaflet";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Stack } from "@mui/material";
// components
import ControlPanel from "../components_telemetry/ControlPanel.js";
import TelemetryPanel from "../components_telemetry/TelemetryPanel.js";
import DroneCharts from "../components_telemetry/DroneCharts.js";
import DroneMap from "../components_telemetry/DroneMap.js";

const theme = createTheme({
  typography: {fontFamily: "Roboto, sans-serif"},
});

function Telemetry() {
  const [data, setData] = useState({});
  const [route, setRoute] = useState([]);  
  const [isDrawing, setIsDrawing] = useState(false); 
  const [startPoint, setStartPoint] = useState(null);

  const [videoFrame, setVideoFrame] = useState(null);
  const isPausedRef = useRef(true);
  const isInMissionRef = useRef(false);

  //Połączenie z backendem przez WebSocket

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

    
    setRoute((prev) => [...prev, {
        id: Date.now() + Math.random(), 
        lat: roundedLat,
        lng: roundedLng
    }]);
    console.log("Dodano punkt do trasy:", { lat: roundedLat, lng: roundedLng });
  };

  const saveStartPoint = () => {
   
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

    const fullRouteToBackend = data.latitude && data.longitude
      ? [{ lat: data.latitude, lng: data.longitude, id: 'start' }, ...route]
      : route;

    if (data.latitude && data.longitude) {
      setStartPoint({ lat: data.latitude, lng: data.longitude, id: 'static_start' });
    }

    await fetch("/start_mission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullRouteToBackend), 
    });

    console.log("Misja rozpoczęta z punktami:", fullRouteToBackend);
  };

  function MapEventHandlers() { 
    const map = useMapEvents({
      click: async (e) => {
       
        if (isDrawing) {
          handleMapClick(e); 
          return; 
        }

        if (!data.is_in_mission) { 
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
    <div style={{display: "flex", gap: "20px", padding: 20, fontFamily: "Arial, sans-serif",}}>
      <Box sx={{ display: "flex", gap: "20px", padding: 3, alignItems: "stretch" }}></Box>
      <ThemeProvider theme={theme}>
        
          {/* LEWA KOLUMNA */}
        
        <Stack spacing={2}>
          <ControlPanel 
            handleControl={handleControl}
            saveStartPoint={saveStartPoint}
            setIsDrawing={setIsDrawing}
            startMission={startMission}
            setRoute={setRoute}
          />
             
          <TelemetryPanel 
            data={data} 
            videoFrame={videoFrame} 
          />
        </Stack>    
                  
        {/* PRAWA KOLUMNA (MAPA) */}    
        <Box sx={{ flex:2 }}>
          <DroneMap 
            data={data}
            isDrawing={isDrawing}
            route={route}            
            startPoint={startPoint}
            MapEventHandlers={MapEventHandlers}
          />
            
          <DroneCharts data={data} />
            
        </Box>
        
      </ThemeProvider>
    </div>
  );
}

export default Telemetry;