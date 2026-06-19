import { useState } from "react";
import { settInnlogging, loggUt, api } from "./api";

export default function Innlogging({ onInnlogget }) {
  const [brukernavn, setBrukernavn] = useState("");
  const [passord, setPassord] = useState("");
  const [feil, setFeil] = useState(null);
  const [laster, setLaster] = useState(false);

  async function loggInn(e) {
    e.preventDefault();
    setFeil(null);
    setLaster(true);
    settInnlogging(brukernavn, passord);

    try {
      await onInnlogget();
    } catch (err) {
      loggUt();
      if (err?.status === 401 || err?.status === 403) {
        setFeil("Feil brukernavn eller passord.");
      } else {
        setFeil("Fikk ikke kontakt med serveren.");
      }
    } finally {
      setLaster(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form onSubmit={loggInn} style={{ width: "100%", maxWidth: 340, background: "var(--surface)", padding: "2rem", borderRadius: "var(--radius-lg)", border: "0.5px solid var(--border)" }}>
        <img src="/logo.png" alt="Eventleie" style={{ height: 52, marginBottom: "1.2rem", display: "block" }} />
        <p className="muted tiny" style={{ margin: "0 0 1.5rem" }}>Mannskap og oppdrag</p>

        <label className="tiny muted">Brukernavn</label>
        <input value={brukernavn} onChange={(e) => setBrukernavn(e.target.value)} autoFocus style={{ margin: "4px 0 12px" }} />

        <label className="tiny muted">Passord</label>
        <input type="password" value={passord} onChange={(e) => setPassord(e.target.value)} style={{ margin: "4px 0 16px" }} />

        {feil && <p style={{ color: "#a32d2d", fontSize: 13, margin: "0 0 12px" }}>{feil}</p>}

        <button type="submit" className="primary" disabled={laster} style={{ width: "100%" }}>
          {laster ? "Logger inn..." : "Logg inn"}
        </button>
      </form>
    </div>
  );
}
