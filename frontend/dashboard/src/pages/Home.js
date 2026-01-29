import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardMedia, Typography, Button, Grid, Box, Container } from "@mui/material";
import SpeedIcon from '@mui/icons-material/Speed';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';

const DRONE_MODELS = [
  {
    id: "scout-x",
    name: "Scout-X (Zwiad)",
    desc: "Niezwykle szybki i zwrotny. Idealny do błyskawicznego mapowania terenu, ale bateria znika w oczach.",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400",
    stats: { speed: "2.5x", battery: "Drenaż 0.05" }
  },
  {
    id: "standard",
    name: "Standard (Zrównoważony)",
    desc: "Klasyczna jednostka treningowa. Dobry balans między prędkością a czasem lotu.",
    image: "https://images.unsplash.com/photo-1473960104312-bfcd437730ea?w=400",
    stats: { speed: "1.0x", battery: "Drenaż 0.02" }
  },
  {
    id: "heavy-lift",
    name: "Heavy-Lift (Transport)",
    desc: "Ciężki dron transportowy. Powolny i stabilny, ale jego potężne akumulatory starczają na bardzo długo.",
    image: "https://images.unsplash.com/photo-1521714161819-15534968fc5f?w=400",
    stats: { speed: "0.5x", battery: "Drenaż 0.01" }
  }
];

function Home() {
  const navigate = useNavigate();

  const selectDroneAndRedirect = (modelId) => {
    navigate(`/telemetry?model=${modelId}`);;
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', py: 8, px: 4, backgroundColor: '#ffb74d' }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: "#2c3e50", mb: 2 }}>
          Panel telemetryczny drona
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Wybierz jednostkę bezzałogową do przeprowadzenia misji
        </Typography>
      </Box>

      <Grid 
        container 
        spacing={3} 
        sx={{ 
          width: '100%', 
          margin: 0, 
          display: 'flex', 
          flexWrap: 'nowrap' // To wymusza jeden rząd
        }}
      >
        {DRONE_MODELS.map((drone) => (
          <Grid item key={drone.id} sx={{ flex: 1 }}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: "0.3s",
              "&:hover": { transform: "scale(1.03)", boxShadow: 6 }
            }}>
              <CardMedia component="img" height="180" image={drone.image} alt={drone.name} />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" sx={{ fontWeight: 'bold' }}>
                  {drone.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {drone.desc}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SpeedIcon fontSize="small" color="primary" />
                      <Typography variant="caption">{drone.stats.speed}</Typography>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BatteryChargingFullIcon fontSize="small" color="success" />
                      <Typography variant="caption">{drone.stats.battery}</Typography>
                   </Box>
                </Box>
              </CardContent>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => selectDroneAndRedirect(drone.id)}
                sx={{ borderRadius: 0, py: 1.5, fontWeight: 'bold' }}
              >
                AKTYWUJ JEDNOSTKĘ
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Home;