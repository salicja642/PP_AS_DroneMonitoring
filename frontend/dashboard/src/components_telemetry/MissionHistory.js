import React, { useState, useEffect } from "react";
import { 
  Box, TextField, List, ListItem, ListItemText, IconButton, 
  Typography, Divider, InputAdornment, Button, 
  Dialog, DialogActions, DialogContent, DialogTitle 
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";

const MissionHistory = ({ route, setRoute }) => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [routeName, setRouteName] = useState("");

  const loadHistory = async () => {
    try {
      const res = await fetch(`/get_history?search=${search}`);
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error("Błąd pobierania historii:", error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [search]);

  const handleSaveRoute = async () => {
    if (route.length === 0) return;

    try {
      const response = await fetch("/save_route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: routeName || `Misja ${new Date().toLocaleTimeString()}`,
          route: route
        }),
      });

      if (response.ok) {
        setOpen(false);
        setRouteName("");
        loadHistory(); // Odświeżamy listę po zapisie
      }
    } catch (error) {
      console.error("Błąd zapisu:", error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Przycisk zapisu na samej górze */}
      <Button
        variant="outlined"
        startIcon={<SaveIcon />}
        onClick={() => setOpen(true)}
        disabled={route.length === 0}
        fullWidth
        sx={{ mb: 2, textTransform: 'none', borderColor: '#4c5ef7', color: '#4c5ef7' }}
      >
        Zapisz obecną trasę
      </Button>

      <TextField
        fullWidth
        size="small"
        placeholder="Szukaj..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <List sx={{ 
        flexGrow: 1,
        maxHeight: "180px", 
        overflow: "auto",
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: '#4c5ef7', borderRadius: '10px' }
      }}>
        {history.length > 0 ? (
          history.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem
                disablePadding
                secondaryAction={
                  <IconButton edge="end" onClick={() => setRoute(item.route)}>
                    <FolderOpenIcon color="primary" fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={item.name}
                  secondary={item.date ? new Date(item.date).toLocaleDateString() : ""}
                  primaryTypographyProps={{ fontSize: '13px', fontWeight: '500' }}
                  secondaryTypographyProps={{ fontSize: '11px' }}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        ) : (
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'gray' }}>
            Brak tras
          </Typography>
        )}
      </List>

      {/* Okienko (Modal) do wpisania nazwy */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ fontSize: '18px' }}>Zapisz trasę</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nazwa misji"
            fullWidth
            variant="standard"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Anuluj</Button>
          <Button onClick={handleSaveRoute} variant="contained" sx={{ bgcolor: '#4c5ef7' }}>
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MissionHistory;