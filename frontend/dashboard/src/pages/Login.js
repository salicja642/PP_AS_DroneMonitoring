import React, { useState } from "react";
import { 
  Box, Button, TextField, Typography, Container, Paper, Avatar, Alert 
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      onLogin();
    } else {
      setError("Błędny login lub hasło");
    }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      backgroundColor: "#ffb74d" 
    }}>
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          <Avatar sx={{ m: "auto", bgcolor: "primary.main", mb: 2 }}>
            <LockOutlinedIcon />
          </Avatar>
          
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Drone Monitoring
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Logowanie
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              label="Login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
            />
            <TextField
              margin="normal"
              fullWidth
              label="Hasło"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, py: 1.5, fontWeight: 'bold' }}
            >
              ZALOGUJ
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;