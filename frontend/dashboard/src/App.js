import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Telemetry from "./pages/Telemetry";
import AudioAnalysis from "./pages/AudioAnalysis";
import { useState } from "react";

import { 
  Button,
  Paper,
  Typography,
  Box,
  Stack,
  TextField,
  Input,
  Tabs,
  Tab
} from "@mui/material";

import {
  PlayArrow,
  Stop,
  Edit as EditIcon,
  RocketLaunch,
  Delete as DeleteIcon
} from "@mui/icons-material";

import HomeIcon from "@mui/icons-material/Home";
import SensorsIcon from "@mui/icons-material/Sensors";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";


function NavTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = location.pathname;

  const handleChange = (event, newValue) => {
    navigate(newValue); 
  };

  return (
    <Tabs
      value={currentTab}
      onChange={handleChange}
      textColor="inherit"
      indicatorColor="secondary"
      sx={{ mb: 2 }}
    >
      <Tab label="Start" icon={<HomeIcon />} iconPosition="start" value="/" />
      <Tab label="Telemetria" icon={<SensorsIcon />} iconPosition="start" value="/telemetry" />
      <Tab label="Informacje" icon={<AudiotrackIcon />} iconPosition="start" value="/audio" />
    </Tabs>
  );
}


function App() {
  const [logged, setLogged] = useState(false);

  if (!logged) {
    return <Login onLogin={() => setLogged(true)} />;
  }

  return (
    <Router>
      <Box sx={{ bgcolor: "#ffbd59", minHeight: "100vh", p: 2 }}>
        <NavTabs />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/telemetry" element={<Telemetry />} />
          <Route path="/audio" element={<AudioAnalysis />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
