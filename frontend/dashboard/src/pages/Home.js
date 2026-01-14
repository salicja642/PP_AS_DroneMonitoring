import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "Arial" }}>
      <h1>🚀 System diagnostyki drona</h1>
      <p>Witaj w aplikacji do analizy danych telemetrycznych i dźwięku silnika.</p>
      <Link to="/telemetry">
        <button style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          marginTop: "20px"
        }}>
          Przejdź do analizy
        </button>
      </Link>
    </div>
  );
}

export default Home;
