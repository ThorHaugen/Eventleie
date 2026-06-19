import { useState } from "react";
import { loggUt } from "./api";
import Innlogging from "./Innlogging";
import AdminDashboard from "./AdminDashboard";
import AnsattVisning from "./AnsattVisning";

export default function App() {
  const [bruker, setBruker] = useState(null);

  function onInnlogget(brukernavn, rolle) {
    setBruker({ brukernavn, rolle });
  }

  function ut() {
    loggUt();
    setBruker(null);
  }

  if (!bruker) return <Innlogging onInnlogget={onInnlogget} />;

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px", background: "var(--surface)", borderBottom: "0.5px solid var(--border)" }}>
        <img src="/logo.png" alt="Eventleie" style={{ height: 28 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="tiny muted">
            {bruker.brukernavn} · {bruker.rolle === "ADMIN" ? "Admin" : "Ansatt"}
          </span>
          <button onClick={ut} className="tiny">Logg ut</button>
        </div>
      </header>
      {bruker.rolle === "ADMIN" ? <AdminDashboard /> : <AnsattVisning brukernavn={bruker.brukernavn} />}
    </div>
  );
}
