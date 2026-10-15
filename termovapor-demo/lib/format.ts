// Formatação pt-PT partilhada por toda a interface.

export const money = (v: number) =>
  new Intl.NumberFormat("pt-PT", { useGrouping: "always", style: "currency", currency: "EUR", minimumFractionDigits: 2 })
    .format(v)
    .replace(/ /g, " ");

export const num = (v: number, decimals = 1) =>
  new Intl.NumberFormat("pt-PT", { useGrouping: "always", maximumFractionDigits: decimals }).format(v);

export const date = (v?: string) => (v ? v.slice(0, 10).split("-").reverse().join("/") : "Não indicado");

export const dateTime = (v?: string) => (v ? `${date(v)} ${v.slice(11, 16)}` : "Não indicado");

// Data atual em Portugal para prazos e novas operações locais.
export const HOJE = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Lisbon" }).format(new Date());

export const nowIso = () => {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${HOJE}T${hh}:${mm}:00`;
};

export const daysUntil = (iso: string, from = HOJE) =>
  Math.round((new Date(`${iso.slice(0, 10)}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86_400_000);

export const prazoLabel = (iso: string) => {
  if (!iso || !Number.isFinite(daysUntil(iso))) return "Prazo por definir";
  const d = daysUntil(iso);
  if (d < 0) return `${Math.abs(d)} ${Math.abs(d) === 1 ? "dia" : "dias"} em atraso`;
  if (d === 0) return "Termina hoje";
  return `Faltam ${d} ${d === 1 ? "dia" : "dias"}`;
};

export const normalize = (text: unknown) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s/.-]/g, " ")
    .toLowerCase();

// Pesquisa por várias palavras em qualquer ordem, sem acentos (como na OE V1.4.33).
export const matches = (query: string, ...fields: unknown[]) => {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = normalize(fields.join(" "));
  return words.every((w) => hay.includes(w));
};

export const sum = <T,>(items: T[], fn: (item: T) => number) => items.reduce((s, item) => s + fn(item), 0);

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^[A-Z]/.test(p))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
