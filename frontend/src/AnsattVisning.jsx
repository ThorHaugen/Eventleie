import { useEffect, useState } from "react";
import { api } from "./api";
import { TypePille, visDato, visTid } from "./felles";

const STATUS_TEKST = {
  SATT_OPP: "Påmeldt",
  BEKREFTET: "Bekreftet",
  FRAVAER: "Meldt fravær",
};

const STATUS_FARGE = {
  SATT_OPP: { color: "var(--text-muted)" },
  BEKREFTET: { color: "var(--teal)" },
  FRAVAER: { color: "var(--warning)" },
};

export default function AnsattVisning({ brukernavn }) {
  const [vakter, setVakter] = useState([]);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState(null);
  const [lasterHandling, setLasterHandling] = useState({});

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
    try {
      await fn();
      await last();
    } finally {
      setLasterHandling((p) => ({ ...p, [id]: false }));
    }
  }

  const mineVakter = vakter.filter((o) => o.minStatus != null);
  const ledigeVakter = vakter.filter((o) => o.minStatus == null);

  if (laster) return <p className="muted" style={{ padding: 24 }}>Laster vakter...</p>;
  if (feil) return <p style={{ padding: 24, color: "#a32d2d" }}>{feil}</p>;

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 24 }}>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px", letterSpacing: 0.3 }}>
          Tilgjengelige vakter
        </h2>
        <p className="muted tiny" style={{ margin: "0 0 1rem" }}>
          Trykk "Ta vakt" for å melde deg på
        </p>

        {ledigeVakter.length === 0 && (
          <p className="muted tiny">Ingen ledige vakter akkurat nå.</p>
        )}

        {ledigeVakter.map((o) => (
          <VaktKort key={o.id} o={o} laster={lasterHandling[o.id]}>
            <button
              className="primary"
              disabled={lasterHandling[o.id]}
              onClick={() => handling(o.id, () => api.taVakt(o.id))}
              style={{ flex: 1 }}
            >
              {lasterHandling[o.id] ? "..." : "Ta vakt"}
            </button>
          </VaktKort>
        ))}
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px", letterSpacing: 0.3 }}>
          Mine vakter
        </h2>
        <p className="muted tiny" style={{ margin: "0 0 1rem" }}>
          {mineVakter.length} {mineVakter.length === 1 ? "vakt" : "vakter"}
        </p>

        {mineVakter.length === 0 && (
          <p className="muted tiny">Du har ikke tatt noen vakter enda.</p>
        )}

        {mineVakter.map((o) => (
          <VaktKort key={o.id} o={o} laster={lasterHandling[o.id]}>
            <div style={{ display: "flex", gap: 8, flex: 1 }}>
              {o.minStatus !== "BEKREFTET" && (
                <button
                  onClick={() => handling(o.id, () => api.bekreft(o.id))}
                  disabled={lasterHandling[o.id]}
                  style={{ flex: 1 }}
                >
                  Bekreft
                </button>
              )}
              {o.minStatus !== "FRAVAER" && (
                <button
                  onClick={() => {
                    if (!confirm("Melde fravær på denne vakta?")) return;
                    handling(o.id, () => api.fravaer(o.id));
                  }}
                  disabled={lasterHandling[o.id]}
                  style={{ flex: 1 }}
                >
                  Meld fravær
                </button>
              )}
              <button
                onClick={() => {
                  if (!confirm("Trekke deg fra denne vakta?")) return;
                  handling(o.id, () => api.trekkVakt(o.id));
                }}
                disabled={lasterHandling[o.id]}
                style={{ flex: 1 }}
              >
                Trekk meg
              </button>
            </div>
          </VaktKort>
        ))}
      </section>
    </div>
  );
}

function VaktKort({ o, laster, children }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "0.5px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "14px 16px",
      marginBottom: 10,
      opacity: laster ? 0.6 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontWeight: 500 }}>{visDato(o.dato)}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {o.minStatus && (
            <span style={{ fontSize: 11, ...STATUS_FARGE[o.minStatus] }}>
              {STATUS_TEKST[o.minStatus]}
            </span>
          )}
          <TypePille type={o.type} />
        </div>
      </div>

      <div style={{ fontWeight: 400, marginBottom: 6 }}>{o.kunde}</div>

      <div className="tiny muted" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
        {o.klokkeslett && <span>Oppmøte {visTid(o.klokkeslett)}</span>}
        {o.kjoretoy && <span>{o.kjoretoy}</span>}
        {o.sted && <span>{o.sted}</span>}
        {o.mannskap?.length > 0 && (
          <span>{o.mannskap.length} {o.mannskap.length === 1 ? "person" : "personer"} påmeldt</span>
        )}
      </div>

      {o.notat && (
        <p className="tiny muted" style={{ margin: "0 0 10px" }}>{o.notat}</p>
      )}

      <div style={{ display: "flex" }}>
        {children}
      </div>
    </div>
  );
}
