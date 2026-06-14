import { useEffect, useState } from "react";
import { api } from "./api";
import { TypePille, visDato, visTid } from "./felles";

export default function AdminDashboard() {
  const [oppdrag, setOppdrag] = useState([]);
  const [valgt, setValgt] = useState(null);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState(null);

  async function last() {
    setLaster(true);
    try {
      const data = await api.alleOppdrag();
      setOppdrag(data);
      setFeil(null);
    } catch {
      setFeil("Klarte ikke hente oppdrag.");
    } finally {
      setLaster(false);
    }
  }

  useEffect(() => {
    last();
  }, []);

  if (laster) return <p className="muted" style={{ padding: 24 }}>Laster oppdrag...</p>;
  if (feil) return <p style={{ padding: 24, color: "#a32d2d" }}>{feil}</p>;

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: 24, maxWidth: 1000, margin: "0 auto", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 320 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Alle oppdrag</h2>
          <button onClick={() => setValgt({ ny: true, type: "MONTERING", ansattIder: [] })}>+ Nytt oppdrag</button>
        </div>

        {oppdrag.length === 0 && <p className="muted tiny">Ingen oppdrag enna. Lag det forste.</p>}

        {oppdrag.map((o) => (
          <div
            key={o.id}
            onClick={() => setValgt(o)}
            style={{
              background: "var(--surface)",
              border: valgt && valgt.id === o.id ? "2px solid var(--info)" : "0.5px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "12px 14px",
              marginBottom: 8,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>{o.kunde}</span>
              <TypePille type={o.type} />
            </div>
            <div className="tiny muted" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span>{visDato(o.dato)}</span>
              <span>{visTid(o.klokkeslett)}</span>
              {o.kjoretoy && <span>{o.kjoretoy}</span>}
              <span style={{ marginLeft: "auto" }}>{o.mannskap.length} pa mannskap</span>
            </div>
          </div>
        ))}
      </div>

      {valgt && (
        <Editor
          key={valgt.id || "ny"}
          oppdrag={valgt}
          onLagret={() => { setValgt(null); last(); }}
          onAvbryt={() => setValgt(null)}
        />
      )}
    </div>
  );
}

function Editor({ oppdrag, onLagret, onAvbryt }) {
  const [kunde, setKunde] = useState(oppdrag.kunde || "");
  const [dato, setDato] = useState(oppdrag.dato || "");
  const [klokkeslett, setKlokkeslett] = useState(oppdrag.klokkeslett ? oppdrag.klokkeslett.slice(0, 5) : "");
  const [type, setType] = useState(oppdrag.type || "MONTERING");
  const [sted, setSted] = useState(oppdrag.sted || "");
  const [notat, setNotat] = useState(oppdrag.notat || "");
  const [lagrer, setLagrer] = useState(false);

  async function lagre() {
    setLagrer(true);
    const data = {
      kunde,
      dato: dato || null,
      klokkeslett: klokkeslett ? klokkeslett + ":00" : null,
      type,
      sted: sted || null,
      notat: notat || null,
      ansattIder: oppdrag.mannskap ? oppdrag.mannskap.map((m) => m.id) : [],
    };
    try {
      if (oppdrag.ny) {
        await api.opprettOppdrag(data);
      } else {
        await api.oppdaterOppdrag(oppdrag.id, data);
      }
      onLagret();
    } catch {
      alert("Klarte ikke lagre. Sjekk at backend kjorer.");
      setLagrer(false);
    }
  }

  async function slett() {
    if (!confirm("Slette dette oppdraget?")) return;
    await api.slettOppdrag(oppdrag.id);
    onLagret();
  }

  return (
    <div style={{ width: 320, background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 14px" }}>
        {oppdrag.ny ? "Nytt oppdrag" : "Rediger oppdrag"}
      </h3>

      <Felt label="Kunde"><input value={kunde} onChange={(e) => setKunde(e.target.value)} /></Felt>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Felt label="Dato"><input type="date" value={dato} onChange={(e) => setDato(e.target.value)} /></Felt>
        <Felt label="Tid"><input type="time" value={klokkeslett} onChange={(e) => setKlokkeslett(e.target.value)} /></Felt>
      </div>

      <Felt label="Type">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="MONTERING">Montering</option>
          <option value="DEMONTERING">Demontering</option>
          <option value="LEVERING">Levering</option>
          <option value="HENTING">Henting</option>
        </select>
      </Felt>

      <Felt label="Sted"><input value={sted} onChange={(e) => setSted(e.target.value)} /></Felt>
      <Felt label="Notat"><textarea rows={3} value={notat} onChange={(e) => setNotat(e.target.value)} /></Felt>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="primary" onClick={lagre} disabled={lagrer} style={{ flex: 1 }}>
          {lagrer ? "Lagrer..." : "Lagre"}
        </button>
        <button onClick={onAvbryt}>Avbryt</button>
        {!oppdrag.ny && <button onClick={slett} style={{ color: "#a32d2d" }}>Slett</button>}
      </div>
    </div>
  );
}

function Felt({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="tiny muted" style={{ display: "block", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}
