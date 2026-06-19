const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

let authHeader = null;

export function settInnlogging(brukernavn, passord) {
  authHeader = "Basic " + btoa(`${brukernavn}:${passord}`);
}

export function loggUt() {
  authHeader = null;
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
  if (res.status === 401 || res.status === 403) {
    const feil = new Error("Ikke tilgang");
    feil.status = res.status;
    throw feil;
  }
  if (!res.ok) {
    throw new Error(`Feil ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  alleOppdrag: () => kall("/api/oppdrag"),
  hentOppdrag: (id) => kall(`/api/oppdrag/${id}`),
  opprettOppdrag: (data) =>
    kall("/api/oppdrag", { method: "POST", body: JSON.stringify(data) }),
  oppdaterOppdrag: (id, data) =>
    kall(`/api/oppdrag/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  slettOppdrag: (id) => kall(`/api/oppdrag/${id}`, { method: "DELETE" }),

  mineOppdrag: () => kall("/api/mine-oppdrag"),
  bekreft: (id) => kall(`/api/mine-oppdrag/${id}/bekreft`, { method: "POST" }),
  fravaer: (id) => kall(`/api/mine-oppdrag/${id}/fravaer`, { method: "POST" }),

  alleVakter: () => kall("/api/vakter"),
  taVakt: (id) => kall(`/api/vakter/${id}/ta`, { method: "POST" }),
  trekkVakt: (id) => kall(`/api/vakter/${id}/ta`, { method: "DELETE" }),

  alleAnsatte: () => kall("/api/ansatte"),
  opprettAnsatt: (data) => kall("/api/ansatte", { method: "POST", body: JSON.stringify(data) }),
  slettAnsatt: (id) => kall(`/api/ansatte/${id}`, { method: "DELETE" }),
};
