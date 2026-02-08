import React, { useEffect, useRef, memo } from "react";
import { Paper, Stack, Typography, Input, Box, Grid } from "@mui/material";
import MissionHistory from "../components_telemetry/MissionHistory.js";

const TelemetryPanel = ({ data, videoFrame, setRoute, route }) => {
  const inputStyle = { border: "1px solid #4c5ef7", borderRadius: 1, px: 1, py: 0.5, width: 200 };
  
  const audioRef = useRef(new Audio("https://drone-backend-rxt2.onrender.com/audio"));

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;

    if (data.is_in_mission && !data.is_paused) {
      audio.play().catch(() => console.log("Czekam na interakcję użytkownika..."));
    } else {
      audio.pause();
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
      <audio ref={audioRef} src="/audio" loop />
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
          {videoFrame ? (
            <img src={videoFrame} alt="Dron" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center"}} />
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