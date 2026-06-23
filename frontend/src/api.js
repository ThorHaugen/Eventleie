const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const LAGRING_NOKKEL = "el_auth";
const TO_DAGER_MS = 2 * 24 * 60 * 60 * 1000;

let authHeader = null;

export function settInnlogging(brukernavn, passord) {
  authHeader = "Basic " + btoa(`${brukernavn}:${passord}`);
  localStorage.setItem(LAGRING_NOKKEL, JSON.stringify({
    header: authHeader,
    utloper: Date.now() + TO_DAGER_MS,
  }));
}

export function lastLagretInnlogging() {
  try {
    const data = JSON.parse(localStorage.getItem(LAGRING_NOKKEL));
    if (data && data.utloper > Date.now()) {
      authHeader = data.header;
      return true;
    }
  } catch {
    // ignore
  }
  localStorage.removeItem(LAGRING_NOKKEL);
  return false;
}

export function loggUt() {
  authHeader = null;
  localStorage.removeItem(LAGRING_NOKKEL);
}

async function kall(sti, valg = {}) {
  const res = await fetch(BASE + sti, {
    ...valg,
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(valg.headers || {}),
    },
  });
  if (!res.ok) {
    const tekst = await res.text().catch(() => "");
    const feil = new Error(tekst || `Feil ${res.status}`);
    feil.status = res.status;
    throw feil;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  alleOppdrag: () => kall("/api/oppdrag"),
  hentOppdrag: (id) => kall(`/api/oppdrag/${id}`),
  opprettOppdrag: (data) => kall("/api/oppdrag", { method: "POST", body: JSON.stringify(data) }),
  oppdaterOppdrag: (id, data) => kall(`/api/oppdrag/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  slettOppdrag: (id) => kall(`/api/oppdrag/${id}`, { method: "DELETE" }),

  mineOppdrag: () => kall("/api/mine-oppdrag"),
  fravaer: (id, begrunnelse) => kall(`/api/mine-oppdrag/${id}/fravaer`, { method: "POST", body: JSON.stringify({ begrunnelse }) }),
  kvitter: (id) => kall(`/api/mine-oppdrag/${id}/kvitter`, { method: "POST" }),
  trekkDeg: (id) => kall(`/api/mine-oppdrag/${id}`, { method: "DELETE" }),

  alleVakter: () => kall("/api/vakter"),
  taVakt: (id) => kall(`/api/vakter/${id}/ta`, { method: "POST" }),
  trekkVakt: (id) => kall(`/api/vakter/${id}/ta`, { method: "DELETE" }),

  meg: () => kall("/api/meg"),
  varsler: () => kall("/api/meg/varsler"),
  endrePassord: (gammelt, nytt) => kall("/api/meg/passord", { method: "PUT", body: JSON.stringify({ gammelt, nytt }) }),
  endreBrukernavn: (brukernavn) => kall("/api/meg/brukernavn", { method: "PUT", body: JSON.stringify({ brukernavn }) }),

  alleAnsatte: () => kall("/api/ansatte"),
  opprettAnsatt: (data) => kall("/api/ansatte", { method: "POST", body: JSON.stringify(data) }),
  slettAnsatt: (id) => kall(`/api/ansatte/${id}`, { method: "DELETE" }),
  settPassord: (id, passord) => kall(`/api/ansatte/${id}/passord`, { method: "PUT", body: JSON.stringify({ passord }) }),
};
