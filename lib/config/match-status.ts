export type MatchStatusGroup =
  | "scheduled"
  | "live"
  | "halftime"
  | "finished"
  | "postponed"
  | "cancelled";

const LIVE_STATUS_SHORTS = new Set(["1H", "HT", "2H", "ET", "BT", "P"]);
const FINISHED_STATUS_SHORTS = new Set(["FT", "AET", "PEN"]);

export const STATUS_LABELS: Record<string, string> = {
  NS: "Por comenzar",
  TBD: "Por comenzar",
  LIVE: "En juego",
  "1H": "En juego",
  HT: "DESCANSO",
  "2H": "En juego",
  ET: "Prórroga",
  BT: "Descanso prórroga",
  P: "Penaltis",
  FT: "Finalizado",
  AET: "Finalizado (prórroga)",
  PEN: "Finalizado (penaltis)",
  PST: "Aplazado",
  CANC: "Cancelado",
  SUSP: "Suspendido",
  ABD: "Suspendido",
  INT: "Suspendido",
  AWD: "Suspendido",
  WO: "Suspendido",
};

function normalizeStatus(statusShort?: string | null): string {
  return (statusShort || "NS").toUpperCase();
}

function formatMadridKickoffTime(kickoff?: string | null): string | null {
  if (!kickoff) return null;

  const date = new Date(kickoff);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getStatusGroup(statusShort?: string | null): MatchStatusGroup {
  const short = normalizeStatus(statusShort);
  if (["1H", "2H", "ET", "P", "LIVE"].includes(short)) return "live";
  if (["HT", "BT"].includes(short)) return "halftime";
  if (FINISHED_STATUS_SHORTS.has(short)) return "finished";
  if (short === "PST") return "postponed";
  if (["CANC", "SUSP", "ABD", "INT", "AWD", "WO"].includes(short)) return "cancelled";
  return "scheduled";
}

export function getStatusLabel(statusShort?: string | null): string {
  const short = normalizeStatus(statusShort);
  return STATUS_LABELS[short] || STATUS_LABELS.NS;
}

export function formatMatchStatus(statusShort?: string | null, elapsed?: number | null, kickoff?: string | null): string {
  const short = normalizeStatus(statusShort);
  const elapsedValue = typeof elapsed === "number" ? `${elapsed}'` : null;

  switch (short) {
    case "NS":
    case "TBD": {
      const kickoffTime = formatMadridKickoffTime(kickoff);
      return kickoffTime ? `Por comenzar · ${kickoffTime}` : "Por comenzar";
    }
    case "1H":
    case "2H":
    case "LIVE":
      return elapsedValue ? `En juego · min ${elapsedValue}` : "En juego";
    case "HT":
      return "DESCANSO";
    case "ET":
      return elapsedValue ? `Prórroga · min ${elapsedValue}` : "Prórroga";
    case "BT":
      return "Descanso prórroga";
    case "P":
      return "Penaltis";
    case "FT":
      return "Finalizado";
    case "AET":
      return "Finalizado (prórroga)";
    case "PEN":
      return "Finalizado (penaltis)";
    default:
      return getStatusLabel(short);
  }
}

export function shouldShowScore(): boolean {
  return true;
}

export function normalizeScoreValue(value?: number | null): number {
  return typeof value === "number" ? value : 0;
}

export function isPollingLiveStatus(statusShort?: string | null): boolean {
  return LIVE_STATUS_SHORTS.has(normalizeStatus(statusShort));
}

export function isFinishedStatus(statusShort?: string | null): boolean {
  return FINISHED_STATUS_SHORTS.has(normalizeStatus(statusShort));
}

export function isLiveLike(statusShort?: string | null): boolean {
  return isPollingLiveStatus(statusShort);
}
