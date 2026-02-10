import React from "react";
import { Paper, Stack, Typography, Button } from "@mui/material";
import { PlayArrow, Stop, Edit as EditIcon, RocketLaunch, Delete as DeleteIcon } from "@mui/icons-material";

const ControlPanel = ({ handleControl, saveStartPoint, setIsDrawing, startMission, setRoute }) => {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 2, fontSize: "20px", fontWeight: 500 }}>
          STEROWANIE
      </Typography>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
          <Button variant="contained" color="success" startIcon={<PlayArrow />} onClick={() => handleControl("start")}>Start</Button>
          <Button variant="contained" color="error" startIcon={<Stop />} onClick={() => handleControl("stop")}>Stop</Button>
          <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => { saveStartPoint(); setIsDrawing(true); }}>Rysuj trasę</Button>
          <Button variant="contained" color="warning" startIcon={<RocketLaunch />} onClick={startMission}>Rozpocznij misję</Button>
          <Button variant="contained" color="inherit" startIcon={<DeleteIcon />} onClick={() => {setRoute([]); handleControl("stop")}}>Wyczyść trasę</Button>
        </Stack>
      </Paper>
    </>
  );
};

export default ControlPanel;