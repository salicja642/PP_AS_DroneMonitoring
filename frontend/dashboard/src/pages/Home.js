import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardMedia, Typography, Button, Grid, Box, Container } from "@mui/material";
import SpeedIcon from '@mui/icons-material/Speed';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import zwiadImg from './images/zwiadowczy.jpg';
import standImg from './images/standardowy.jpeg';
import transImg from './images/transportowy.png';

const DRONE_MODELS = [
  {
    id: "scout-x",
    name: "Zwiadowczy",
    desc: "Niezwykle szybki i zwrotny. Idealny do błyskawicznego mapowania terenu, ale bateria znika w oczach.",
    image: zwiadImg,
    stats: { speed: "2.5x", battery: "Drenaż 0.05" }
  },
  {
    id: "standard",
    name: "Zrównoważony",
    desc: "Klasyczna jednostka treningowa. Dobry balans między prędkością a czasem lotu.",
    image: standImg,
    stats: { speed: "1.0x", battery: "Drenaż 0.02" }
  },
  {
    id: "heavy-lift",
    name: "Transportowy",
    desc: "Ciężki dron transportowy. Powolny i stabilny, ale jego potężne akumulatory starczają na bardzo długo.",
    image: transImg,
    stats: { speed: "0.5x", battery: "Drenaż 0.01" }
  }
];

function Home() {
  const navigate = useNavigate();

  const selectDroneAndRedirect = (modelId) => {
    navigate(`/telemetry?model=${modelId}`);;
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100vh',           
      backgroundColor: '#ffb74d',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',  
      alignItems: 'center', 
      overflow: 'hidden',        
      boxSizing: 'border-box'
    }}>
      <Box sx={{ textAlign: "center", mb: 6, px: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: "#2c3e50", mb: 2 }}>
          Panel Telemetryczny Drona
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Wybierz jednostkę bezzałogową do przeprowadzenia misji
        </Typography>
      </Box>

      <Container maxWidth="lg">
        <Grid 
          container 
          spacing={3} 
          sx={{ 
            display: 'flex', 
            flexWrap: 'nowrap',
            width: '100%',
            margin: 0 
          }}
        >
          {DRONE_MODELS.map((drone) => (
            <Grid item key={drone.id} sx={{ flex: 1, minWidth: 0 }}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: "0.3s",
                "&:hover": { 
                  boxShadow: "0px 10px 20px rgba(0,0,0,0.3)", 
                  borderColor: "primary.main", 
                  border: '1px solid rgba(25, 118, 210, 0.5)'
                }
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
      </Container>
    </Box>
  );
}

export default Home;