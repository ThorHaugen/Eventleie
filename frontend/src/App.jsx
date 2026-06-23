import { useEffect, useRef, useState } from "react";
import { loggUt, lastLagretInnlogging, settInnlogging, api } from "./api";
import Innlogging from "./Innlogging";
import AdminDashboard from "./AdminDashboard";
import AnsattVisning from "./AnsattVisning";

export default function App() {
  const [bruker, setBruker] = useState(null);
  const [sjekker, setSjekker] = useState(true);

  useEffect(() => {
    if (lastLagretInnlogging()) {
      api.meg()
        .then((meg) => setBruker({ brukernavn: meg.brukernavn, rolle: meg.rolle }))
        .catch(() => { loggUt(); })
        .finally(() => setSjekker(false));
    } else {
      setSjekker(false);
    }
  }, []);

  async function onInnlogget() {
    const meg = await api.meg();
    setBruker({ brukernavn: meg.brukernavn, rolle: meg.rolle });
  }

  function ut() {
    loggUt();
    setBruker(null);
  }

  if (sjekker) return null;
  if (!bruker) return <Innlogging onInnlogget={onInnlogget} />;

  const erAdmin = ["SJEF", "UTVIKLER", "ADMIN"].includes(bruker.rolle);

  return (
    <div>
      <Header bruker={bruker} onLoggUt={ut} onBrukernavnEndret={(nyttNavn) => setBruker({ ...bruker, brukernavn: nyttNavn })} />
      {erAdmin
        ? <AdminDashboard bruker={bruker} />
        : <AnsattVisning brukernavn={bruker.brukernavn} />}
    </div>
  );
}

function Header({ bruker, onLoggUt, onBrukernavnEndret }) {
  const [aapen, setAapen] = useState(false);
  const [visInnstillinger, setVisInnstillinger] = useState(false);
  const [varsler, setVarsler] = useState(0);
  const ref = useRef();

  function oppdaterVarsler() {
    if (bruker.rolle === "ANSATT") {
      api.varsler().then((r) => setVarsler(r.antall)).catch(() => {});
    }
  }

  useEffect(() => {
    oppdaterVarsler();
    const t = setInterval(oppdaterVarsler, 30000);
    return () => clearInterval(t);
  }, [bruker.rolle]);

  useEffect(() => {
    function klikk(e) {
      if (ref.current && !ref.current.contains(e.target)) setAapen(false);
    }
    document.addEventListener("mousedown", klikk);
    return () => document.removeEventListener("mousedown", klikk);
  }, []);

  const initialer = bruker.brukernavn
    ? bruker.brukernavn.slice(0, 2).toUpperCase()
    : "??";

  return (
    <>
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 24px", height: 56,
        background: "var(--surface)",
        borderBottom: "0.5px solid var(--border)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <img src="/logo.png" alt="Eventleie" style={{ height: 28 }} />

        <div ref={ref} style={{ position: "relative" }}>
          <button
            onClick={() => setAapen(!aapen)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "none", border: "none", padding: "6px 10px",
              borderRadius: "var(--radius)", cursor: "pointer",
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "var(--info-bg)", border: "1.5px solid var(--info)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "var(--info)",
              position: "relative",
            }}>
              {initialer}
              {varsler > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#c0392b", fontSize: 10, fontWeight: 700,
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  animation: "puls 1.4s ease-in-out infinite",
                }}>
                  {varsler}
                </span>
              )}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                {bruker.brukernavn}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {bruker.rolle === "SJEF" ? "Sjef" : bruker.rolle === "UTVIKLER" ? "Utvikler" : bruker.rolle === "ADMIN" ? "Administrator" : "Ansatt"}
              </div>
            </div>
            <span style={{ fontSize: 10, color: "var(--text-faint)", marginLeft: 2 }}>▼</span>
          </button>

          {aapen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)",
              background: "var(--surface)", border: "0.5px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)", minWidth: 200, overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Innlogget som</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{bruker.brukernavn}</div>
              </div>
              <DropdownKnapp onClick={() => { setVisInnstillinger(true); setAapen(false); }}>
                Innstillinger
              </DropdownKnapp>
              <div style={{ borderTop: "0.5px solid var(--border)" }}>
                <DropdownKnapp onClick={onLoggUt} fare>
                  Logg ut
                </DropdownKnapp>
              </div>
            </div>
          )}
        </div>
      </header>

      {visInnstillinger && (
        <InnstillingerModal
          bruker={bruker}
          onLukk={() => setVisInnstillinger(false)}
          onBrukernavnEndret={(navn) => { onBrukernavnEndret(navn); setVisInnstillinger(false); }}
        />
      )}

      <style>{`
        @keyframes puls {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}

function DropdownKnapp({ onClick, fare, children }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "100%", textAlign: "left", padding: "11px 16px",
        background: hover ? "var(--bg)" : "transparent",
        border: "none", borderRadius: 0, fontSize: 14,
        color: fare ? "#e05555" : "var(--text)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function InnstillingerModal({ bruker, onLukk, onBrukernavnEndret }) {
  const [fane, setFane] = useState("passord");
  const [gammelt, setGammelt] = useState("");
  const [nytt, setNytt] = useState("");
  const [bekreft, setBekreft] = useState("");
  const [nyttBrukernavn, setNyttBrukernavn] = useState("");
  const [feil, setFeil] = useState(null);
  const [ok, setOk] = useState(null);
  const [lagrer, setLagrer] = useState(false);

  function nullstill() {
    setFeil(null); setOk(null);
    setGammelt(""); setNytt(""); setBekreft(""); setNyttBrukernavn("");
  }

  async function byttPassord(e) {
    e.preventDefault();
    if (nytt !== bekreft) { setFeil("Passordene er ikke like."); return; }
    if (nytt.length < 6) { setFeil("Passordet må være minst 6 tegn."); return; }
    setLagrer(true); setFeil(null);
    try {
      await api.endrePassord(gammelt, nytt);
      settInnlogging(bruker.brukernavn, nytt);
      setOk("Passord oppdatert.");
      setGammelt(""); setNytt(""); setBekreft("");
    } catch (err) {
      setFeil(err.message || "Feil gammelt passord.");
    } finally {
      setLagrer(false);
    }
  }

  async function byttBrukernavn(e) {
    e.preventDefault();
    if (!nyttBrukernavn.trim()) { setFeil("Skriv inn nytt brukernavn."); return; }
    setLagrer(true); setFeil(null);
    try {
      await api.endreBrukernavn(nyttBrukernavn.trim());
      onBrukernavnEndret(nyttBrukernavn.trim());
    } catch (err) {
      setFeil(err.message || "Klarte ikke endre brukernavn.");
      setLagrer(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }}>
      <div style={{
        background: "var(--surface)", border: "0.5px solid var(--border-strong)",
        borderRadius: "var(--radius-lg)", width: "90%", maxWidth: 400,
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: "0.5px solid var(--border)",
        }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Innstillinger</span>
          <button onClick={onLukk} style={{ background: "none", border: "none", fontSize: 18, color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>✕</button>
        </div>

        <div style={{ display: "flex", borderBottom: "0.5px solid var(--border)" }}>
          {["passord", "brukernavn"].map((f) => (
            <button key={f} onClick={() => { setFane(f); nullstill(); }} style={{
              flex: 1, padding: "12px 0", background: "none", border: "none",
              borderBottom: fane === f ? "2px solid var(--info)" : "2px solid transparent",
              color: fane === f ? "var(--info)" : "var(--text-muted)",
              fontWeight: fane === f ? 600 : 400, fontSize: 14, cursor: "pointer",
            }}>
              {f === "passord" ? "Bytt passord" : "Bytt brukernavn"}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {fane === "passord" ? (
            <form onSubmit={byttPassord}>
              {!["ADMIN", "SJEF", "UTVIKLER"].includes(bruker.rolle) && (
                <Felt label="Nåværende passord">
                  <input type="password" value={gammelt} onChange={(e) => setGammelt(e.target.value)} placeholder="••••••••" />
                </Felt>
              )}
              <Felt label="Nytt passord">
                <input type="password" value={nytt} onChange={(e) => setNytt(e.target.value)} placeholder="Minst 6 tegn" />
              </Felt>
              <Felt label="Bekreft nytt passord">
                <input type="password" value={bekreft} onChange={(e) => setBekreft(e.target.value)} placeholder="Gjenta passord" />
              </Felt>
              {feil && <p style={{ color: "#e05555", fontSize: 13, margin: "0 0 12px" }}>{feil}</p>}
              {ok && <p style={{ color: "var(--teal)", fontSize: 13, margin: "0 0 12px" }}>{ok}</p>}
              <button type="submit" className="primary" disabled={lagrer} style={{ width: "100%", padding: 11 }}>
                {lagrer ? "Lagrer..." : "Oppdater passord"}
              </button>
            </form>
          ) : (
            <form onSubmit={byttBrukernavn}>
              <p className="tiny muted" style={{ margin: "0 0 14px" }}>
                Brukernavnet brukes kun til innlogging, ikke synlig for andre.
              </p>
              <Felt label="Nytt brukernavn">
                <input value={nyttBrukernavn} onChange={(e) => setNyttBrukernavn(e.target.value)} placeholder="f.eks. magne.hansen" autoFocus />
              </Felt>
              {feil && <p style={{ color: "#e05555", fontSize: 13, margin: "0 0 12px" }}>{feil}</p>}
              <button type="submit" className="primary" disabled={lagrer} style={{ width: "100%", padding: 11 }}>
                {lagrer ? "Lagrer..." : "Oppdater brukernavn"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Felt({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}
