import React, { useEffect, useRef, memo } from "react";
import { Paper, Stack, Typography, Input, Box, Grid } from "@mui/material";
import MissionHistory from "../components_telemetry/MissionHistory.js";

const TelemetryPanel = ({ data, setRoute, route }) => {
  const inputStyle = { border: "1px solid #4c5ef7", borderRadius: 1, px: 1, py: 0.5, width: 200 };
  
  const audioRef = useRef(null);

  // Funkcja pomocnicza, która tworzy obiekt audio, jeśli jeszcze go nie ma
  const ensureAudioInitialized = () => {
    if (!audioRef.current) {
      console.log("Inicjalizacja dźwięku silnika...");
      const audio = new Audio("https://drone-backend-rxt2.onrender.com/audio");
      audio.loop = true;
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  useEffect(() => {
    // Jeśli flaga misji jest aktywna, próbujemy odpalić dźwięk
    if (data.is_in_mission && !data.is_paused) {
      const audio = ensureAudioInitialized();
      
      audio.play().catch((err) => {
        // Jeśli to się nie uda (bo np. flaga zmieniła się automatycznie, a nie przez kliknięcie)
        // to po prostu czekamy na następną zmianę lub kliknięcie.
        console.warn("Audio zablokowane - czekam na interakcję z UI");
      });

    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [data.is_in_mission, data.is_paused]);

  useEffect(() => {
    if (audioRef.current && data.speed !== undefined) {
      const rate = 1 + (data.speed / 100);
      audioRef.current.playbackRate = Math.min(Math.max(rate, 0.5), 4.0);
    }
  }, [data.speed]);

  return (
    <Stack spacing={1.8}>
      <Typography variant="h5" sx={{ mb: 1, fontSize: "20px", fontWeight: 500 }}>
        TELEMETRIA DRONA
      </Typography>
      
      <Paper elevation={3} sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* LEWA KOLUMNA: Pola danych */}
          <Grid item xs={6}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ width: 100 }}>Prędkość:</Typography>
                <Input value={data.speed ?? "—"} readOnly sx={inputStyle} />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ width: 100 }}>Temperatura:</Typography>
                <Input value={data.temperature ?? "—"} readOnly sx={inputStyle} />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ width: 100 }}>Wysokość:</Typography>
                <Input value={data.altitude ?? "—"} readOnly sx={inputStyle} />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ width: 100 }}>Bateria:</Typography>
                <Input value={data.battery ?? "—"} readOnly sx={inputStyle} />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ width: 100 }}>GPS:</Typography>
                <Input value = {data.latitude && data.longitude ? `${Number(data.latitude).toFixed(6)}, ${Number(data.longitude).toFixed(6)}`: "—"} readOnly sx={inputStyle} />
              </Stack>
            </Stack>
          </Grid>

          {/* PRAWA KOLUMNA: Historia Misji */}
          <Grid item xs={6}>
            <Box sx={{ 
              borderLeft: "1px solid #e0e0e0", 
              pl: 2, 
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}>
              <MissionHistory setRoute={setRoute} route={route}/>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Sekcja Video */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, bgcolor: "#f8f9fa" }}>
        <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", mb: 2, bgcolor: "#000", borderRadius: 1 }}>
          {data.is_in_mission ? (
            <img 
              src="https://drone-backend-rxt2.onrender.com/video_feed" 
              alt="Dron Live Feed" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          ) : (
            <Typography color="gray">Oczekiwanie na start misji...</Typography>
          )}
        </Box>

        <Typography variant="h5" sx={{ mb: 1, fontSize: "14px", fontWeight: 500 }}>
          AKTYWNA JEDNOSTKA: {data.drone_model_name || "PROFIL ZAŁADOWANY"}
        </Typography>
                
      </Paper>
    </Stack>
  );
};

export default TelemetryPanel;