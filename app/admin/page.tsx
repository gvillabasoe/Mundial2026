"use client";

import { useState, useEffect, useCallback } from "react";
import { LogOut, Save, Check, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { GROUPS, ALL_TEAMS, SCORING } from "@/lib/data";
import {
  getEmptyResults, loadAdminResults, saveAdminResults,
  isAdminSessionActive, setAdminSession,
  type AdminResults,
} from "@/lib/admin-store";

const ADMIN_USERNAME = "canallita";
const ADMIN_PASSWORD = "oyarsexo";

// ─── Main page ──────────────────────────────────────

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLoggedIn(isAdminSessionActive());
    setHydrated(true);
  }, []);

  if (!hydrated) return null;
  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  return <AdminPanel onLogout={() => { setAdminSession(false); setLoggedIn(false); }} />;
}

// ─── Login ──────────────────────────────────────────

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handle = () => {
    const u = username.replace("@", "").trim().toLowerCase();
    if (u === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAdminSession(true);
      onLogin();
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-bg-0">
      <div className="card w-full max-w-[360px] !p-8 bg-gradient-to-b from-bg-4 to-bg-2">
        <h1 className="font-display text-2xl font-black text-text-warm mb-1">Admin</h1>
        <p className="text-xs text-text-muted mb-7">Panel de administración</p>

        <div className="mb-3">
          <label className="text-[11px] text-text-muted mb-1 block">Usuario</label>
          <input
            className="input-field"
            placeholder="@usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handle()}
          />
        </div>
        <div className="mb-5">
          <label className="text-[11px] text-text-muted mb-1 block">Contraseña</label>
          <div className="relative">
            <input
              className="input-field !pr-10"
              type={showPass ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handle()}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted bg-transparent border-none cursor-pointer"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-danger mb-3">{error}</p>}
        <button className="btn btn-primary w-full" onClick={handle}>Entrar</button>
      </div>
    </div>
  );
}

// ─── Admin Panel ─────────────────────────────────────

type Tab = "grupos" | "eliminatorias" | "especiales";

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("grupos");
  const [results, setResults] = useState<AdminResults>(getEmptyResults);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    setResults(loadAdminResults());
  }, []);

  const save = useCallback(() => {
    saveAdminResults(results);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2500);
  }, [results]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "grupos", label: "Grupos" },
    { key: "eliminatorias", label: "Eliminatorias" },
    { key: "especiales", label: "Especiales" },
  ];

  return (
    <div className="min-h-screen bg-bg-0 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-0/95 backdrop-blur border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-[720px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold text-text-warm">Panel Admin</h1>
            <p className="text-[10px] text-text-muted">@{ADMIN_USERNAME}</p>
          </div>
          <div className="flex items-center gap-2">
            {saveState === "saved" && (
              <span className="flex items-center gap-1 text-[11px] text-success font-semibold animate-fade-in">
                <Check size={13} /> Guardado
              </span>
            )}
            <button
              onClick={save}
              className="btn btn-primary !py-2 !px-4 text-sm"
            >
              <Save size={14} /> Guardar
            </button>
            <button
              onClick={onLogout}
              className="btn btn-ghost !py-2 !px-3 text-sm"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-4 pt-5">
        {/* Tabs */}
        <div className="flex gap-0.5 bg-bg-3 rounded-[10px] p-[3px] mb-5">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all border-none ${
                tab === t.key ? "bg-bg-5 text-text-primary" : "text-text-muted bg-transparent"
              }`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "grupos" && <TabGrupos results={results} setResults={setResults} />}
        {tab === "eliminatorias" && <TabEliminatorias results={results} setResults={setResults} />}
        {tab === "especiales" && <TabEspeciales results={results} setResults={setResults} />}

        {/* Floating save */}
        <div className="fixed bottom-6 right-6 flex items-center gap-2">
          {saveState === "saved" && (
            <span className="text-[11px] text-success font-semibold bg-bg-4 border border-success/20 rounded-full px-3 py-1 animate-fade-in">
              <Check size={11} className="inline mr-1" />Guardado
            </span>
          )}
          <button
            onClick={save}
            className="btn btn-primary shadow-xl !gap-1.5"
          >
            <Save size={15} /> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Grupos ─────────────────────────────────────

function TabGrupos({
  results, setResults,
}: {
  results: AdminResults;
  setResults: React.Dispatch<React.SetStateAction<AdminResults>>;
}) {
  const updateGroupPos = (group: string, pos: number, team: string) => {
    setResults((prev) => {
      const current = prev.groups[group] ? [...prev.groups[group]] : ["", "", "", ""];
      current[pos] = team;
      return { ...prev, groups: { ...prev.groups, [group]: current } };
    });
  };

  return (
    <div className="grid gap-3">
      <p className="text-[11px] text-text-muted mb-1">
        Introduce la clasificación final de cada grupo (1º → 4º).
      </p>
      {Object.entries(GROUPS).map(([g, teams]) => {
        const current = results.groups[g] ?? ["", "", "", ""];
        const positions = ["1.º", "2.º", "3.º", "4.º"];
        return (
          <div key={g} className="card !p-4">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="font-display text-sm font-extrabold px-2.5 py-0.5 rounded-md"
                style={{ background: `${groupColor(g)}20`, color: groupColor(g) }}
              >
                Grupo {g}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {positions.map((label, pos) => (
                <div key={pos} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-5 shrink-0">{label}</span>
                  <select
                    className="input-field !py-2 text-xs"
                    value={current[pos] ?? ""}
                    onChange={(e) => updateGroupPos(g, pos, e.target.value)}
                  >
                    <option value="">— equipo —</option>
                    {teams.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Eliminatorias ──────────────────────────────

const KO_ROUNDS: Array<{
  key: keyof Pick<AdminResults["knockout"], "dieciseisavos" | "octavos" | "cuartos" | "semis" | "finalTeams">;
  label: string;
  max: number;
}> = [
  { key: "dieciseisavos", label: "Ronda de 32", max: 32 },
  { key: "octavos", label: "Octavos de Final", max: 16 },
  { key: "cuartos", label: "Cuartos de Final", max: 8 },
  { key: "semis", label: "Semifinales", max: 4 },
  { key: "finalTeams", label: "Final (2 finalistas)", max: 2 },
];

function TabEliminatorias({
  results, setResults,
}: {
  results: AdminResults;
  setResults: React.Dispatch<React.SetStateAction<AdminResults>>;
}) {
  const [expanded, setExpanded] = useState<string>("dieciseisavos");

  const toggleTeam = (roundKey: string, team: string, max: number) => {
    setResults((prev) => {
      const current: string[] = (prev.knockout as Record<string, string[]>)[roundKey] ?? [];
      const next = current.includes(team)
        ? current.filter((t) => t !== team)
        : current.length < max
        ? [...current, team]
        : current;
      return { ...prev, knockout: { ...prev.knockout, [roundKey]: next } };
    });
  };

  const setScalar = (key: "campeon" | "subcampeon" | "tercero", val: string) => {
    setResults((prev) => ({ ...prev, knockout: { ...prev.knockout, [key]: val } }));
  };

  const sortedTeams = [...ALL_TEAMS].sort((a, b) => a.localeCompare(b, "es"));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] text-text-muted mb-1">
        Marca los equipos que han alcanzado cada ronda. Solo importa si llegaron, no por qué camino.
      </p>

      {KO_ROUNDS.map(({ key, label, max }) => {
        const selected: string[] = (results.knockout as Record<string, string[]>)[key] ?? [];
        const isOpen = expanded === key;
        return (
          <div key={key} className="card !p-0 overflow-hidden">
            <button
              className="flex items-center justify-between w-full px-4 py-3 text-left cursor-pointer bg-transparent border-none"
              onClick={() => setExpanded(isOpen ? "" : key)}
            >
              <span className="font-display text-sm font-bold text-text-warm">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted">
                  {selected.length}/{max}
                </span>
                {isOpen ? <ChevronUp size={15} className="text-text-muted" /> : <ChevronDown size={15} className="text-text-muted" />}
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-white/[0.04]">
                <div className="pt-3 grid grid-cols-2 gap-1.5">
                  {sortedTeams.map((team) => {
                    const checked = selected.includes(team);
                    return (
                      <button
                        key={team}
                        onClick={() => toggleTeam(key, team, max)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all border text-left ${
                          checked
                            ? "bg-gold/10 border-gold/30 text-gold-light font-semibold"
                            : "bg-bg-2 border-transparent text-text-muted hover:border-white/10"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-sm border shrink-0 flex items-center justify-center ${checked ? "bg-gold border-gold" : "border-white/20"}`}>
                          {checked && <Check size={9} className="text-bg-0" />}
                        </span>
                        {team}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Podio */}
      <div className="card !p-4">
        <p className="font-display text-sm font-bold text-text-warm mb-3">Podio final</p>
        <div className="flex flex-col gap-2.5">
          {(["campeon", "subcampeon", "tercero"] as const).map((field) => {
            const labels = { campeon: "🥇 Campeón (50 pts)", subcampeon: "🥈 Subcampeón (30 pts)", tercero: "🥉 Tercer puesto (20 pts)" };
            return (
              <div key={field}>
                <label className="text-[10px] text-text-muted mb-1 block">{labels[field]}</label>
                <select
                  className="input-field !py-2 text-xs"
                  value={results.knockout[field]}
                  onChange={(e) => setScalar(field, e.target.value)}
                >
                  <option value="">— equipo —</option>
                  {[...ALL_TEAMS].sort((a, b) => a.localeCompare(b, "es")).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Especiales ─────────────────────────────────

const SPECIAL_FIELDS: Array<{
  key: keyof AdminResults["specials"];
  label: string;
  pts: number;
  type: "text" | "number";
}> = [
  { key: "mejorJugador", label: "Mejor Jugador", pts: SCORING.especiales.mejorJugador, type: "text" },
  { key: "mejorJoven", label: "Mejor Jugador Joven", pts: SCORING.especiales.mejorJoven, type: "text" },
  { key: "maxGoleador", label: "Máximo Goleador", pts: SCORING.especiales.maxGoleador, type: "text" },
  { key: "maxAsistente", label: "Máximo Asistente", pts: SCORING.especiales.maxAsistente, type: "text" },
  { key: "mejorPortero", label: "Mejor Portero", pts: SCORING.especiales.mejorPortero, type: "text" },
  { key: "maxGoleadorEsp", label: "Máx. Goleador Español", pts: SCORING.especiales.maxGoleadorEsp, type: "text" },
  { key: "primerGolEsp", label: "Primer Gol Español", pts: SCORING.especiales.primerGolEsp, type: "text" },
  { key: "revelacion", label: "Selección Revelación", pts: SCORING.especiales.revelacion, type: "text" },
  { key: "decepcion", label: "Selección Decepción", pts: SCORING.especiales.decepcion, type: "text" },
  { key: "minutoPrimerGol", label: "Minuto primer gol del Mundial", pts: SCORING.especiales.minutoPrimerGol, type: "number" },
];

function TabEspeciales({
  results, setResults,
}: {
  results: AdminResults;
  setResults: React.Dispatch<React.SetStateAction<AdminResults>>;
}) {
  const update = (key: keyof AdminResults["specials"], val: string) => {
    setResults((prev) => ({
      ...prev,
      specials: {
        ...prev.specials,
        [key]: key === "minutoPrimerGol" ? (val === "" ? null : parseInt(val)) : val,
      },
    }));
  };

  return (
    <div className="card !p-4">
      <p className="text-[11px] text-text-muted mb-4">
        Introduce los ganadores reales de cada categoría especial.
      </p>
      <div className="flex flex-col gap-3">
        {SPECIAL_FIELDS.map(({ key, label, pts, type }) => (
          <div key={key}>
            <label className="text-[10px] text-text-muted mb-1 flex items-center justify-between">
              <span>{label}</span>
              <span className="text-gold/70">{pts} pts</span>
            </label>
            <input
              className="input-field !py-2 text-xs"
              type={type}
              placeholder={type === "number" ? "Minuto (1-90+)" : "Nombre..."}
              value={
                key === "minutoPrimerGol"
                  ? (results.specials.minutoPrimerGol ?? "")
                  : (results.specials[key as keyof Omit<AdminResults["specials"], "minutoPrimerGol">] ?? "")
              }
              onChange={(e) => update(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────

const GROUP_COLORS_MAP: Record<string, string> = {
  A: "#6BBF78", B: "#EC1522", C: "#EAEA7E", D: "#0C66B6",
  E: "#F48020", F: "#006858", G: "#B0A8D9", H: "#55BCBB",
  I: "#4E3AA2", J: "#FEA999", K: "#F0417A", L: "#82001C",
};
function groupColor(g: string): string { return GROUP_COLORS_MAP[g] ?? "#98A3B8"; }
