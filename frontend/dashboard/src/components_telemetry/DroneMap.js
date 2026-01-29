import React from "react";
import { Box, Typography } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet"; 
import "leaflet/dist/leaflet.css";

const droneIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const pinIcon = L.icon({
  iconUrl: "https://icon-library.com/images/location-pin-icon/location-pin-icon-14.jpg",
  iconSize: [32, 32],
});

const DroneMap = ({ data, isDrawing, route, startPoint, MapEventHandlers }) => {
    const currentFullRoute = startPoint ? [startPoint, ...route] : route;
    const currentPolylinePositions = currentFullRoute.map(p => [p.lat, p.lng]);
    return (
    <Box sx={{ width: "100%", height: "auto"}}>
      <Typography variant="h6" sx={{ mb: 1, fontSize: "20px", fontWeight: 500 }}>
        POZYCJA DRONA
      </Typography>

      {data.latitude && data.longitude ? (
        <div style={{ height: "500px", width: "100%" }}> 
          <MapContainer
            center={[data.latitude, data.longitude]}
            zoom={14}
            scrollWheelZoom={true}
            style={{
              height: "100%", 
              width: "100%",
              borderRadius: "10px",
              border: "1px solid #aaa",
              zIndex: 1
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <MapEventHandlers />
            
            <Marker position={[data.latitude, data.longitude]} icon={droneIcon}>
              <Popup>
                <b>Dron</b><br />
                Lat: {data.latitude}<br />
                Lon: {data.longitude}
              </Popup>
            </Marker>

            {isDrawing && currentFullRoute.length > 1 && (
              <>
                {currentFullRoute.map((point, index) => (
                  <Marker key={point.id} position={[point.lat, point.lng]} icon={pinIcon}>
                    <Popup>Punkt {index + 1}</Popup>
                  </Marker>
                ))}
                <Polyline positions={currentPolylinePositions} color="red" />
              </>
            )}
          </MapContainer>
        </div>
      ) : (
        <p>Ładowanie lokalizacji…</p>
      )}
    </Box>
  );
};

export default DroneMap;