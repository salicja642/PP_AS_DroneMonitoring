import React, { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

function AudioAnalysis() {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  // Tworzenie WaveSurfer po załadowaniu komponentu
  useEffect(() => {
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#87CEEB",
      progressColor: "#1E90FF",
      cursorColor: "#000",
      height: 100,
    });

    // Ładujemy plik z backendu
    wavesurfer.current.load("/audio");

    return () => {
      wavesurfer.current.destroy();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>🎧 Analiza dźwięku</h1>
      <p>Wizualizacja przebiegu fali dźwięku silnika drona.</p>

      {/* MIEJSCE NA WAVESURFER */}
      <div
        ref={waveformRef}
        style={{
          width: "80%",
          margin: "20px auto",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      ></div>

      {/* PRZYCISKI */}
      <button
        onClick={() => wavesurfer.current.playPause()}
        style={{ margin: 10, padding: "10px 20px" }}
      >
        ▶️ Play / Pause
      </button>
    </div>
  );
}

export default AudioAnalysis;