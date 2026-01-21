import React from "react";
import { Paper, Stack, Typography, Input, Box } from "@mui/material";

const TelemetryPanel = ({ data, videoFrame }) => {
  const inputStyle = { border: "1px solid #4c5ef7", borderRadius: 1, px: 1, py: 0.5, width: 200 };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ mb: 2, fontSize: "20px", fontWeight: 500 }}>TELEMETRIA DRONA</Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
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
      </Paper>
      
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {videoFrame ? <img src={videoFrame} alt="Dron" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : <Typography color="gray">Brak sygnału wideo</Typography>}
      </Paper>
    </Stack>
  );
};

export default TelemetryPanel;