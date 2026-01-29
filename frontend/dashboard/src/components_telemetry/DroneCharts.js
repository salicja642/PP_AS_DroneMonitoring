import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Paper, Stack } from "@mui/material";

const DroneCharts = ({ data }) => {
  const chartRefSpeed = useRef(null);
  const chartInstanceSpeed = useRef(null);
  const chartRefAltitude = useRef(null);
  const chartInstanceAltitude = useRef(null);

  useEffect(() => {
    const commonOptions = {
      animation: false,
      scales: { y: { beginAtZero: true } },
      responsive: true,
      maintainAspectRatio: false,
    };

    if (chartRefSpeed.current) {
      chartInstanceSpeed.current = new Chart(chartRefSpeed.current.getContext("2d"), {
        type: "line",
        data: {
          labels: Array.from({ length: 20 }, (_, i) => i),
          datasets: [{
            label: "Prędkość drona (m/s)",
            data: Array(20).fill(0),
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 2,
            fill: false,
          }],
        },
        options: commonOptions,
      });
    }

    if (chartRefAltitude.current) {
      chartInstanceAltitude.current = new Chart(chartRefAltitude.current.getContext("2d"), {
        type: "line",
        data: {
          labels: Array.from({ length: 20 }, (_, i) => i),
          datasets: [{
            label: "Wysokość drona (m)",
            data: Array(20).fill(100),
            borderColor: "rgb(255, 99, 132)",
            borderWidth: 2,
            fill: false,
          }],
        },
        options: commonOptions,
      });
    }

    return () => {
      chartInstanceSpeed.current?.destroy();
      chartInstanceAltitude.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (chartInstanceSpeed.current && typeof data.speed === "number") {
      const speedData = chartInstanceSpeed.current.data.datasets[0].data;
      speedData.push(data.speed);
      if (speedData.length > 20) speedData.shift();
      chartInstanceSpeed.current.update();
    }

    if (chartInstanceAltitude.current && typeof data.altitude === "number") {
      const altData = chartInstanceAltitude.current.data.datasets[0].data;
      altData.push(data.altitude);
      if (altData.length > 20) altData.shift();
      chartInstanceAltitude.current.update();
    }
  }, [data]); 

  return (
    <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
      <Paper elevation={3} sx={{ p: 2, flex: 1}}>
        {chartRefSpeed && <canvas ref={chartRefSpeed} width="400" height="200" />}
      </Paper>
      <Paper elevation={3} sx={{ p: 2, flex: 1}}>
        {chartRefAltitude && <canvas ref={chartRefAltitude} width="400" height="200"/>}
      </Paper>
    </Stack>
  );
};

export default DroneCharts;