export const TYPE_FARGER = {
  MONTERING: { bg: "var(--info-bg)", fg: "var(--info)", tekst: "Montering" },
  DEMONTERING: { bg: "var(--warning-bg)", fg: "var(--warning)", tekst: "Demontering" },
  LEVERING: { bg: "#f1efe8", fg: "var(--text-muted)", tekst: "Levering" },
  HENTING: { bg: "#f1efe8", fg: "var(--text-muted)", tekst: "Henting" },
};

export function TypePille({ type }) {
  const t = TYPE_FARGER[type] || TYPE_FARGER.LEVERING;
  return (
    <span style={{ background: t.bg, color: t.fg, fontSize: 11, padding: "2px 8px", borderRadius: 20 }}>
      {t.tekst}
    </span>
  );
}

const MND = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

export function visDato(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate()}. ${MND[d.getMonth()]}`;
}

export function visTid(t) {
  if (!t) return "";
  return t.slice(0, 5);
}
