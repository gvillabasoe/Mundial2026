export interface GroupResults {
  [group: string]: string[];
}

export interface KnockoutResults {
  dieciseisavos: string[];
  octavos: string[];
  cuartos: string[];
  semis: string[];
  finalTeams: string[];
  campeon: string;
  subcampeon: string;
  tercero: string;
}

export interface SpecialResults {
  mejorJugador: string;
  mejorJoven: string;
  maxGoleador: string;
  maxAsistente: string;
  mejorPortero: string;
  maxGoleadorEsp: string;
  primerGolEsp: string;
  revelacion: string;
  decepcion: string;
  minutoPrimerGol: number | null;
}

export interface AdminResults {
  groups: GroupResults;
  knockout: KnockoutResults;
  specials: SpecialResults;
  savedAt: string | null;
}

const STORAGE_KEY = "penita_admin_results_v2";
const SESSION_KEY = "penita_admin_session_v1";

export function getEmptyResults(): AdminResults {
  return {
    groups: {},
    knockout: {
      dieciseisavos: [],
      octavos: [],
      cuartos: [],
      semis: [],
      finalTeams: [],
      campeon: "",
      subcampeon: "",
      tercero: "",
    },
    specials: {
      mejorJugador: "",
      mejorJoven: "",
      maxGoleador: "",
      maxAsistente: "",
      mejorPortero: "",
      maxGoleadorEsp: "",
      primerGolEsp: "",
      revelacion: "",
      decepcion: "",
      minutoPrimerGol: null,
    },
    savedAt: null,
  };
}

export function loadAdminResults(): AdminResults {
  if (typeof window === "undefined") return getEmptyResults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getEmptyResults();
    return JSON.parse(raw) as AdminResults;
  } catch {
    return getEmptyResults();
  }
}

export function saveAdminResults(results: AdminResults): void {
  if (typeof window === "undefined") return;
  try {
    const toSave: AdminResults = { ...results, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* noop */ }
}

export function hasAdminResults(): boolean {
  const r = loadAdminResults();
  return r.savedAt !== null;
}

export function isAdminSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
}

export function setAdminSession(active: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (active) localStorage.setItem(SESSION_KEY, "1");
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* noop */ }
}
