import { useEffect, useState } from "react";
import { api } from "./api";
import { TypePille, visDato, visTid } from "./felles";

function rolleNavn(rolle) {
  if (rolle === "SJEF") return "Sjef";
  if (rolle === "UTVIKLER") return "Utvikler";
  if (rolle === "ADMIN") return "Admin";
  return "Ansatt";
}

function hierarki(rolle) {
  if (rolle === "SJEF") return 3;
  if (rolle === "UTVIKLER") return 2;
  if (rolle === "ADMIN") return 1;
  return 0;
}

export default function AdminDashboard({ bruker }) {
  const [fane, setFane] = useState("oppdrag");
  const kallerNiva = hierarki(bruker?.rolle);
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <FaneKnapp aktiv={fane === "oppdrag"} onClick={() => setFane("oppdrag")}>Oppdrag</FaneKnapp>
        <FaneKnapp aktiv={fane === "ansatte"} onClick={() => setFane("ansatte")}>Ansatte</FaneKnapp>
      </div>
      {fane === "oppdrag" ? <OppdragPanel kallerNiva={kallerNiva} /> : <AnsattPanel kallerNiva={kallerNiva} />}
    </div>
  );
}

function FaneKnapp({ aktiv, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 20px",
        borderRadius: 20,
        border: "none",
        background: aktiv ? "var(--info)" : "var(--surface)",
        color: aktiv ? "#fff" : "var(--text-muted)",
        fontWeight: aktiv ? 600 : 400,
        fontSize: 14,
      }}
    >
      {children}
    </button>
  );
}

// ─── OPPDRAG ────────────────────────────────────────────────────────────────

function OppdragPanel({ kallerNiva }) {
  const [oppdrag, setOppdrag] = useState([]);
  const [ansatte, setAnsatte] = useState([]);
  const [valgt, setValgt] = useState(null);
  const [laster, setLaster] = useState(true);

  async function last() {
    const [o, a] = await Promise.all([api.alleOppdrag(), api.alleAnsatte()]);
    setOppdrag(o);
    setAnsatte(a);
    setLaster(false);
  }

  useEffect(() => { last(); }, []);

  function velg(o) { setValgt(o); window.scrollTo({ top: 0, behavior: "smooth" }); }

  if (laster) return <p className="muted tiny">Laster...</p>;

  if (valgt) {
    return (
      <OppdragEditor
        oppdrag={valgt}
        ansatte={ansatte}
        kallerNiva={kallerNiva}
        onFerdig={() => { setValgt(null); last(); }}
        onAvbryt={() => setValgt(null)}
      />
    );
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Alle oppdrag</h2>
        <button
          className="primary"
          onClick={() => velg({ ny: true, type: "MONTERING", mannskap: [] })}
          style={{ fontSize: 14, padding: "8px 16px" }}
        >
          + Nytt
        </button>
      </div>

      {oppdrag.length === 0 && <p className="muted tiny">Ingen oppdrag enda.</p>}

      {oppdrag.map((o) => (
        <div
          key={o.id}
          onClick={() => velg(o)}
          style={{
            background: "var(--surface)",
            border: "0.5px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "14px 16px",
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>{o.kunde}</span>
            <TypePille type={o.type} />
          </div>
          <div className="tiny muted" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: o.mannskap.length ? 8 : 0 }}>
            <span>{visDato(o.dato)}</span>
            {o.klokkeslett && <span>{visTid(o.klokkeslett)}</span>}
            {o.kjoretoy && <span>{o.kjoretoy}</span>}
          </div>
          {o.mannskap.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {o.mannskap.map((m) => (
                <span key={m.id} style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: statusFarge(m.status).bg,
                  color: statusFarge(m.status).fg,
                }}>
                  {m.navn}
                </span>
              ))}
            </div>
          )}
          {o.mannskap.length === 0 && (
            <span className="tiny muted">Ingen påmeldte</span>
          )}
        </div>
      ))}
    </>
  );
}

function statusFarge(status) {
  if (status === "BEKREFTET") return { bg: "var(--teal-bg)", fg: "var(--teal)" };
  if (status === "FRAVAER") return { bg: "var(--warning-bg)", fg: "var(--warning)" };
  return { bg: "var(--border)", fg: "var(--text-muted)" };
}

function OppdragEditor({ oppdrag, ansatte, kallerNiva, onFerdig, onAvbryt }) {
  const [kunde, setKunde] = useState(oppdrag.kunde || "");
  const [dato, setDato] = useState(oppdrag.dato || "");
  const [klokkeslett, setKlokkeslett] = useState(oppdrag.klokkeslett ? oppdrag.klokkeslett.slice(0, 5) : "");
  const [type, setType] = useState(oppdrag.type || "MONTERING");
  const [sted, setSted] = useState(oppdrag.sted || "");
  const [adresse, setAdresse] = useState(oppdrag.adresse || "");
  const [maksAntall, setMaksAntall] = useState(oppdrag.maksAntall ?? "");
  const [notat, setNotat] = useState(oppdrag.notat || "");
  const [mannskap, setMannskap] = useState(oppdrag.mannskap || []);
  const [leggTilId, setLeggTilId] = useState("");
  const [lagrer, setLagrer] = useState(false);

  const ikkeValgte = ansatte.filter((a) =>
    !mannskap.find((m) => m.id === a.id) && hierarki(a.rolle) < kallerNiva
  );

  function leggTil() {
    const a = ansatte.find((a) => a.id === leggTilId);
    if (!a) return;
    setMannskap([...mannskap, { id: a.id, navn: a.navn, status: "SATT_OPP" }]);
    setLeggTilId("");
  }

  async function fjern(id) {
    const nyMannskap = mannskap.filter((m) => m.id !== id);
    setMannskap(nyMannskap);
    if (!oppdrag.ny) {
      await api.oppdaterOppdrag(oppdrag.id, {
        kunde, dato: dato || null,
        klokkeslett: klokkeslett ? klokkeslett + ":00" : null,
        type, sted: sted || null, adresse: adresse || null, notat: notat || null,
        maksAntall: maksAntall !== "" ? Number(maksAntall) : null,
        ansattIder: nyMannskap.map((m) => m.id),
      });
    }
  }

  async function lagre() {
    const mangler = [];
    if (!kunde.trim()) mangler.push("Kunde");
    if (!dato) mangler.push("Dato");
    if (!klokkeslett) mangler.push("Tid");
    if (!sted.trim()) mangler.push("Sted");
    if (!adresse.trim()) mangler.push("Adresse");
    if (maksAntall === "" || maksAntall === null) mangler.push("Maks antall mannskap");
    if (mangler.length > 0) {
      alert("Fyll inn følgende felter:\n• " + mangler.join("\n• "));
      return;
    }
    setLagrer(true);
    const data = {
      kunde, dato: dato || null,
      klokkeslett: klokkeslett ? klokkeslett + ":00" : null,
      type, sted: sted || null, adresse: adresse || null, notat: notat || null,
          maksAntall: maksAntall !== "" ? Number(maksAntall) : null,
      ansattIder: mannskap.map((m) => m.id),
    };
    try {
      if (oppdrag.ny) await api.opprettOppdrag(data);
      else await api.oppdaterOppdrag(oppdrag.id, data);
      onFerdig();
    } catch {
      alert("Klarte ikke lagre.");
      setLagrer(false);
    }
  }

  async function slett() {
    if (!confirm("Slette dette oppdraget?")) return;
    await api.slettOppdrag(oppdrag.id);
    onFerdig();
  }

  return (
    <div>
      <button onClick={onAvbryt} className="tiny muted" style={{ background: "none", border: "none", padding: "0 0 12px", cursor: "pointer", color: "var(--text-muted)" }}>
        ← Tilbake
      </button>

      <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 16px" }}>
        {oppdrag.ny ? "Nytt oppdrag" : "Rediger oppdrag"}
      </h2>

      <Felt label="Kunde">
        <input value={kunde} onChange={(e) => setKunde(e.target.value)} placeholder="Kundenavn" autoFocus />
      </Felt>

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

      <Felt label="Sted"><input value={sted} onChange={(e) => setSted(e.target.value)} placeholder="Valgfritt" /></Felt>
      <Felt label="Adresse"><input value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Gate og nummer, postnr sted" /></Felt>
      <Felt label="Maks antall mannskap">
        <input type="number" min="1" value={maksAntall} onChange={(e) => setMaksAntall(e.target.value)} placeholder="Ingen grense" />
      </Felt>
      <Felt label="Notat"><textarea rows={2} value={notat} onChange={(e) => setNotat(e.target.value)} placeholder="Valgfritt" /></Felt>

      <div style={{ margin: "16px 0 8px", fontWeight: 600, fontSize: 14 }}>Mannskap</div>

      {mannskap.length === 0 && <p className="tiny muted" style={{ marginBottom: 8 }}>Ingen påmeldte enda.</p>}

      {mannskap.map((m) => (
        <div key={m.id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 12px", marginBottom: 6,
          background: "var(--bg)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)",
        }}>
          <div>
            <span style={{ fontSize: 14 }}>{m.navn}</span>
            <span className="tiny muted" style={{ marginLeft: 8 }}>
              {m.status === "BEKREFTET" ? "✓ Bekreftet" : m.status === "FRAVAER" ? "Fravær" : "Påmeldt"}
            </span>
          </div>
          {hierarki(ansatte.find((a) => a.id === m.id)?.rolle) < kallerNiva && (
            <button onClick={() => fjern(m.id)} style={{ color: "#a32d2d", fontSize: 12, padding: "4px 10px" }}>
              Fjern
            </button>
          )}
        </div>
      ))}

      {ikkeValgte.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <select value={leggTilId} onChange={(e) => setLeggTilId(e.target.value)} style={{ flex: 1 }}>
            <option value="">Legg til ansatt...</option>
            {ikkeValgte.map((a) => (
              <option key={a.id} value={a.id}>{a.navn}</option>
            ))}
          </select>
          <button onClick={leggTil} disabled={!leggTilId} className="primary" style={{ whiteSpace: "nowrap" }}>
            + Legg til
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <button className="primary" onClick={lagre} disabled={lagrer} style={{ flex: 1, padding: "10px" }}>
          {lagrer ? "Lagrer..." : "Lagre"}
        </button>
        {!oppdrag.ny && (
          <button onClick={slett} style={{ color: "#a32d2d", padding: "10px 16px" }}>Slett</button>
        )}
      </div>
    </div>
  );
}

// ─── ANSATTE ────────────────────────────────────────────────────────────────

function AnsattPanel({ kallerNiva }) {
  const [ansatte, setAnsatte] = useState([]);
  const [laster, setLaster] = useState(true);
  const [visSkjema, setVisSkjema] = useState(false);
  const [navn, setNavn] = useState("");
  const [brukernavn, setBrukernavn] = useState("");
  const [passord, setPassord] = useState("");
  const [rolle, setRolle] = useState("ANSATT");
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState(null);

  async function last() {
    setAnsatte(await api.alleAnsatte());
    setLaster(false);
  }

  useEffect(() => { last(); }, []);

  async function opprett(e) {
    e.preventDefault();
    if (!navn || !brukernavn || !passord) return;
    setLagrer(true);
    setFeil(null);
    try {
      await api.opprettAnsatt({ navn, brukernavn, passord, rolle });
      setNavn(""); setBrukernavn(""); setPassord(""); setRolle("ANSATT");
      setVisSkjema(false);
      last();
    } catch {
      setFeil("Klarte ikke opprette ansatt. Brukernavn kan allerede være i bruk.");
    } finally {
      setLagrer(false);
    }
  }

  if (laster) return <p className="muted tiny">Laster...</p>;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Ansatte</h2>
        <button className="primary" onClick={() => setVisSkjema(!visSkjema)} style={{ fontSize: 14, padding: "8px 16px" }}>
          {visSkjema ? "Avbryt" : "+ Ny ansatt"}
        </button>
      </div>

      {visSkjema && (
        <form onSubmit={opprett} style={{
          background: "var(--surface)", border: "0.5px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "16px", marginBottom: 16,
        }}>
          <Felt label="Navn"><input value={navn} onChange={(e) => setNavn(e.target.value)} placeholder="Fullt navn" autoFocus /></Felt>
          <Felt label="Brukernavn"><input value={brukernavn} onChange={(e) => setBrukernavn(e.target.value)} placeholder="f.eks. magne.hansen" /></Felt>
          <Felt label="Passord"><input type="password" value={passord} onChange={(e) => setPassord(e.target.value)} placeholder="Midlertidig passord" /></Felt>
          <Felt label="Rolle">
            <select value={rolle} onChange={(e) => setRolle(e.target.value)}>
              <option value="ANSATT">Ansatt</option>
              {kallerNiva >= 2 && <option value="ADMIN">Admin</option>}
              {kallerNiva >= 3 && <option value="UTVIKLER">Utvikler</option>}
            </select>
          </Felt>
          {feil && <p style={{ color: "#a32d2d", fontSize: 13, margin: "0 0 10px" }}>{feil}</p>}
          <button type="submit" className="primary" disabled={lagrer} style={{ width: "100%", padding: 10 }}>
            {lagrer ? "Oppretter..." : "Opprett ansatt"}
          </button>
        </form>
      )}

      {ansatte.map((a) => (
        <AnsattKort key={a.id} ansatt={a} kallerNiva={kallerNiva} onOppdater={last} />
      ))}
    </>
  );
}

function AnsattKort({ ansatt, kallerNiva, onOppdater }) {
  const [utvid, setUtvid] = useState(false);
  const [nyttPassord, setNyttPassord] = useState("");
  const [bekreftNavn, setBekreftNavn] = useState("");
  const [visSlettModal, setVisSlettModal] = useState(false);
  const [lagrerPassord, setLagrerPassord] = useState(false);
  const [sletter, setSletter] = useState(false);
  const [passordFeil, setPassordFeil] = useState(null);
  const [passordOk, setPassordOk] = useState(false);

  async function endrePassord(e) {
    e.preventDefault();
    if (!nyttPassord || nyttPassord.length < 6) {
      setPassordFeil("Passordet må være minst 6 tegn.");
      return;
    }
    setLagrerPassord(true);
    setPassordFeil(null);
    try {
      await api.settPassord(ansatt.id, nyttPassord);
      setNyttPassord("");
      setPassordOk(true);
      setTimeout(() => setPassordOk(false), 3000);
    } catch {
      setPassordFeil("Klarte ikke endre passord.");
    } finally {
      setLagrerPassord(false);
    }
  }

  async function slettAnsatt() {
    if (bekreftNavn.trim().toLowerCase() !== ansatt.navn.trim().toLowerCase()) return;
    setSletter(true);
    try {
      await api.slettAnsatt(ansatt.id);
      onOppdater();
    } catch {
      setSletter(false);
      setVisSlettModal(false);
    }
  }

  return (
    <>
      <div style={{
        background: "var(--surface)", border: "0.5px solid var(--border)",
        borderRadius: "var(--radius-lg)", marginBottom: 8, overflow: "hidden",
      }}>
        <div
          onClick={() => setUtvid(!utvid)}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer" }}
        >
          <div>
            <div style={{ fontWeight: 500 }}>{ansatt.navn}</div>
            <div className="tiny muted">{ansatt.brukernavn} · {rolleNavn(ansatt.rolle)}</div>
          </div>
          <span className="tiny muted">{utvid ? "▲" : "▼"}</span>
        </div>

        {utvid && (
          <div style={{ borderTop: "0.5px solid var(--border)", padding: "14px 16px" }}>
            {hierarki(ansatt.rolle) < kallerNiva ? (
              <>
                <form onSubmit={endrePassord} style={{ marginBottom: 16 }}>
                  <div className="tiny muted" style={{ marginBottom: 6, fontWeight: 600 }}>Sett nytt passord</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="password"
                      value={nyttPassord}
                      onChange={(e) => setNyttPassord(e.target.value)}
                      placeholder="Nytt passord (min. 6 tegn)"
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="primary" disabled={lagrerPassord} style={{ whiteSpace: "nowrap" }}>
                      {lagrerPassord ? "..." : "Sett passord"}
                    </button>
                  </div>
                  {passordFeil && <p style={{ color: "#a32d2d", fontSize: 12, margin: "6px 0 0" }}>{passordFeil}</p>}
                  {passordOk && <p style={{ color: "var(--teal)", fontSize: 12, margin: "6px 0 0" }}>Passord oppdatert.</p>}
                </form>
                <button
                  onClick={() => setVisSlettModal(true)}
                  style={{ fontSize: 13, color: "#a32d2d", background: "none", border: "0.5px solid #a32d2d", borderRadius: "var(--radius)", padding: "6px 14px", cursor: "pointer" }}
                >
                  Slett ansatt
                </button>
              </>
            ) : (
              <p className="tiny muted">Du har ikke tilgang til å administrere denne brukeren.</p>
            )}
          </div>
        )}
      </div>

      {visSlettModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{
            background: "var(--surface)", border: "0.5px solid var(--border-strong)",
            borderRadius: "var(--radius-lg)", padding: 24, maxWidth: 360, width: "90%",
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Slett {ansatt.navn}?</div>
            <p className="tiny muted" style={{ marginBottom: 16 }}>
              Dette fjerner ansatte og alle tilhørende vakttildelinger permanent. Handlingen kan ikke angres.
            </p>
            <p className="tiny" style={{ marginBottom: 8 }}>
              Skriv inn <strong>{ansatt.navn}</strong> for å bekrefte:
            </p>
            <input
              value={bekreftNavn}
              onChange={(e) => setBekreftNavn(e.target.value)}
              placeholder={ansatt.navn}
              autoFocus
              style={{ width: "100%", marginBottom: 14, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setVisSlettModal(false); setBekreftNavn(""); }}
                style={{ flex: 1, padding: 10 }}
              >
                Avbryt
              </button>
              <button
                onClick={slettAnsatt}
                disabled={sletter || bekreftNavn.trim().toLowerCase() !== ansatt.navn.trim().toLowerCase()}
                style={{
                  flex: 1, padding: 10,
                  background: bekreftNavn.trim().toLowerCase() === ansatt.navn.trim().toLowerCase() ? "#a32d2d" : "var(--border)",
                  color: "#fff", border: "none", borderRadius: "var(--radius)", cursor: "pointer",
                }}
              >
                {sletter ? "Sletter..." : "Slett permanent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
