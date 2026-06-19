import { useEffect, useState } from "react";
import { api } from "./api";
import { TypePille, visDato, visTid } from "./felles";

export default function AnsattVisning({ brukernavn, onKvitter }) {
  const [vakter, setVakter] = useState([]);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState(null);
  const [lasterHandling, setLasterHandling] = useState({});
  const [fane, setFane] = useState("mine");

  async function last() {
    setLaster(true);
    try {
      setVakter(await api.alleVakter());
      setFeil(null);
    } catch {
      setFeil("Klarte ikke hente vaktene.");
    } finally {
      setLaster(false);
    }
  }

  useEffect(() => { last(); }, []);

  async function handling(id, fn) {
    setLasterHandling((p) => ({ ...p, [id]: true }));
    try { await fn(); await last(); }
    finally { setLasterHandling((p) => ({ ...p, [id]: false })); }
  }

  const usette = vakter.filter((o) => o.minStatus != null && !o.sett);
  const mineVakter = vakter.filter((o) => o.minStatus != null);
  const ledigeVakter = vakter.filter((o) => o.minStatus == null);

  if (laster) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--text-muted)", fontSize: 14 }}>Laster vakter...</div>;
  if (feil) return <p style={{ padding: 24, color: "#e05555" }}>{feil}</p>;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", paddingBottom: 48 }}>

      {usette.length > 0 && (
        <div style={{
          margin: "16px 16px 0",
          background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.4)",
          borderRadius: "var(--radius-lg)", padding: "14px 16px",
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#e05555", marginBottom: 8 }}>
            🔴 Du har {usette.length} ny{usette.length > 1 ? "e" : ""} vakttildeling{usette.length > 1 ? "er" : ""}
          </div>
          {usette.map((o) => (
            <div key={o.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0", borderTop: "0.5px solid rgba(192,57,43,0.2)",
            }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{o.kunde}</span>
                <span className="tiny muted" style={{ marginLeft: 8 }}>{visDato(o.dato)}{o.klokkeslett ? ` · ${visTid(o.klokkeslett)}` : ""}</span>
              </div>
              <button
                className="primary"
                onClick={() => handling(o.id, async () => { await api.kvitter(o.id); onKvitter?.(); })}
                disabled={lasterHandling[o.id]}
                style={{ fontSize: 12, padding: "5px 12px" }}
              >
                {lasterHandling[o.id] ? "..." : "Kvitter"}
              </button>
            </div>
          ))}
        </div>
      )}

      <TabBar fane={fane} setFane={setFane} antallMine={mineVakter.length} antallLedige={ledigeVakter.length} />

      <div style={{ padding: "16px 16px 0" }}>
        {fane === "mine" ? (
          <Seksjon>
            {mineVakter.length === 0
              ? <TomMelding>Du har ikke tatt noen vakter enda.</TomMelding>
              : mineVakter.map((o) => (
                  <VaktKort key={o.id} o={o} laster={lasterHandling[o.id]} minVakt>
                    <VaktHandlinger o={o} lasterHandling={lasterHandling} handling={handling} />
                  </VaktKort>
                ))
            }
          </Seksjon>
        ) : (
          <Seksjon>
            {ledigeVakter.length === 0
              ? <TomMelding>Ingen ledige vakter akkurat nå.</TomMelding>
              : ledigeVakter.map((o) => {
                  const erFull = o.maksAntall != null && o.mannskap.length >= o.maksAntall;
                  return (
                    <VaktKort key={o.id} o={o} laster={lasterHandling[o.id]}>
                      {erFull ? (
                        <FullChip />
                      ) : (
                        <button
                          className="primary"
                          disabled={lasterHandling[o.id]}
                          onClick={() => handling(o.id, () => api.taVakt(o.id))}
                          style={{ flex: 1 }}
                        >
                          {lasterHandling[o.id] ? "..." : "Ta vakt"}
                        </button>
                      )}
                    </VaktKort>
                  );
                })
            }
          </Seksjon>
        )}
      </div>
    </div>
  );
}

function TabBar({ fane, setFane, antallMine, antallLedige }) {
  const tabs = [
    { id: "mine", label: "Mine vakter", antall: antallMine },
    { id: "alle", label: "Tilgjengelige", antall: antallLedige },
  ];
  return (
    <div style={{
      display: "flex",
      borderBottom: "0.5px solid var(--border)",
      margin: "16px 0 0",
      background: "var(--surface)",
      position: "sticky", top: 56, zIndex: 10,
    }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setFane(t.id)}
          style={{
            flex: 1, padding: "13px 0",
            background: "none", border: "none", borderRadius: 0,
            borderBottom: fane === t.id ? "2px solid var(--info)" : "2px solid transparent",
            color: fane === t.id ? "var(--info)" : "var(--text-muted)",
            fontWeight: fane === t.id ? 700 : 400,
            fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}
        >
          {t.label}
          {t.antall > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: fane === t.id ? "var(--info-bg)" : "var(--border)",
              color: fane === t.id ? "var(--info)" : "var(--text-muted)",
              borderRadius: 10, padding: "1px 6px",
            }}>
              {t.antall}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function VaktHandlinger({ o, lasterHandling, handling }) {
  const [visFravaer, setVisFravaer] = useState(false);
  const [begrunnelse, setBegrunnelse] = useState("");

  if (visFravaer) {
    return (
      <div style={{ flex: 1 }}>
        <textarea
          value={begrunnelse}
          onChange={(e) => setBegrunnelse(e.target.value)}
          placeholder="Skriv begrunnelse for fravær..."
          rows={2}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setVisFravaer(false)} style={{ flex: 1 }}>Avbryt</button>
          <button
            onClick={() => handling(o.id, () => api.fravaer(o.id, begrunnelse))}
            disabled={!begrunnelse.trim() || lasterHandling[o.id]}
            style={{ flex: 1, background: "var(--warning-bg)", color: "var(--warning)", border: "0.5px solid var(--warning)" }}
          >
            {lasterHandling[o.id] ? "..." : "Bekreft fravær"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
      {o.minStatus === "FRAVAER" ? (
        <span style={{
          flex: 1, fontSize: 12, color: "var(--warning)", padding: "8px 0",
        }}>
          Meldt fravær{o.fravaerBegrunnelse ? `: ${o.fravaerBegrunnelse}` : ""}
        </span>
      ) : (
        <button
          onClick={() => setVisFravaer(true)}
          style={{ flex: 1, fontSize: 13 }}
        >
          Meld fravær
        </button>
      )}
    </div>
  );
}

function VaktKort({ o, laster, children }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "0.5px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "16px",
      marginBottom: 10,
      opacity: laster ? 0.6 : 1,
      transition: "opacity .15s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{o.kunde}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>
            <span>{visDato(o.dato)}</span>
            {o.klokkeslett && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>· {visTid(o.klokkeslett)}</span>}
            {o.sted && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>· {o.sted}</span>}
          </div>
        </div>
        <TypePille type={o.type} />
      </div>

      {o.adresse && (
        <div style={{ fontSize: 13, color: "var(--info)", marginBottom: 8 }}>
          📍 {o.adresse}
        </div>
      )}

      {o.mannskap?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {o.mannskap.map((m) => (
            <span key={m.id} style={{
              fontSize: 11, padding: "2px 9px", borderRadius: 20,
              background: m.status === "FRAVAER" ? "var(--warning-bg)" : "var(--border)",
              color: m.status === "FRAVAER" ? "var(--warning)" : "var(--text-muted)",
            }}>{m.navn}</span>
          ))}
          {o.maksAntall && (
            <span className="tiny muted" style={{ padding: "2px 0", alignSelf: "center" }}>
              {o.mannskap.length}/{o.maksAntall}
            </span>
          )}
        </div>
      )}

      {o.notat && (
        <p className="tiny muted" style={{ margin: "0 0 10px", fontStyle: "italic" }}>{o.notat}</p>
      )}

      <div style={{ display: "flex" }}>{children}</div>
    </div>
  );
}

function FullChip() {
  return (
    <span style={{
      flex: 1, textAlign: "center", fontSize: 13, fontWeight: 600,
      color: "var(--warning)", background: "var(--warning-bg)",
      borderRadius: "var(--radius)", padding: "8px 14px",
      border: "0.5px solid rgba(245,166,35,0.3)",
    }}>
      Fullt
    </span>
  );
}

function Seksjon({ children }) {
  return <section style={{ marginBottom: 36 }}>{children}</section>;
}

function TomMelding({ children }) {
  return (
    <div style={{
      padding: "20px 16px", textAlign: "center",
      background: "var(--surface)", borderRadius: "var(--radius-lg)",
      border: "0.5px solid var(--border)",
      color: "var(--text-muted)", fontSize: 14,
    }}>
      {children}
    </div>
  );
}
