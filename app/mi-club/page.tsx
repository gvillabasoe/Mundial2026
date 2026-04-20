"use client";

import { useState, useEffect } from "react";
import { Shield, LogOut, Eye, EyeOff, User, Star, Clock } from "lucide-react";
import { Flag, GroupBadge, EmptyState } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { PARTICIPANTS, GROUPS } from "@/lib/data";
import { hasAdminResults, loadAdminResults } from "@/lib/admin-store";
import { recalculateAllParticipants } from "@/lib/scoring-engine";
import type { Team } from "@/lib/data";

export default function MiClubPage() {
  const { user, login, logout } = useAuth();
  if (!user) return <LoginView onLogin={login} />;
  return <PrivateZone user={user} onLogout={logout} />;
}

function LoginView({ onLogin }: { onLogin: (u: string, p: string) => boolean }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if (!username || !password) { setError("Completa los campos"); return; }
    setLoading(true);
    setTimeout(() => {
      if (!onLogin(username, password)) setError("Credenciales incorrectas");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="px-4 flex items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-[360px] !p-8 text-center animate-fade-in"
        style={{ background: "linear-gradient(135deg, #0D1014, #080B0F)" }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }}>
          <Shield size={26} style={{ color: "#D4AF37" }} />
        </div>
        <h2 className="font-display text-xl font-black tracking-tight mb-0.5" style={{ color: "#E8EAF0" }}>
          Mi Club
        </h2>
        <p className="text-[11px] text-text-muted mb-7">Acceso privado</p>

        <div className="text-left mb-3">
          <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">Usuario</label>
          <input className="input-field" placeholder="@usuario" value={username}
            onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handle()} />
        </div>
        <div className="text-left mb-5">
          <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">Contraseña</label>
          <div className="relative">
            <input className="input-field !pr-10" type={showPass ? "text" : "password"}
              placeholder="Contraseña" value={password}
              onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handle()} />
            <button onClick={() => setShowPass(prev => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted bg-transparent border-none cursor-pointer">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        <button className="btn btn-primary w-full" onClick={handle} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <p className="text-[10px] text-text-muted/40 mt-5">Carlos_M · cualquier contraseña</p>
      </div>
    </div>
  );
}

function PrivateZone({ user, onLogout }: { user: { id: string; username: string }; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("resumen");
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [allParticipants, setAllParticipants] = useState<Team[]>(PARTICIPANTS);

  useEffect(() => {
    if (hasAdminResults()) {
      setAllParticipants(recalculateAllParticipants([...PARTICIPANTS], loadAdminResults()));
    }
  }, []);

  const userTeams = allParticipants.filter((p) => p.userId === user.id);
  const team = userTeams[activeTeamIdx] || userTeams[0];
  const tabs = ["Resumen", "Partidos", "Grupos", "Eliminatorias", "Especiales", "Favoritos"];

  return (
    <div className="px-4 pt-5 max-w-[640px] mx-auto">
      <div className="flex items-center justify-between mb-5 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight" style={{ color: "#E8EAF0" }}>Mi Club</h1>
        </div>
        <button className="btn btn-ghost !py-2 !px-3.5 text-xs" onClick={onLogout}>
          <LogOut size={13} /> Salir
        </button>
      </div>

      <div className="card flex items-center gap-3 mb-3 animate-fade-in">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(107,191,120,0.1)" }}>
          <User size={18} style={{ color: "#6BBF78" }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">@{user.username}</p>
        </div>
        <span className="badge badge-green">Activo</span>
      </div>

      {userTeams.length > 1 && (
        <div className="flex gap-1.5 mb-3 overflow-x-auto">
          {userTeams.map((t, i) => (
            <button key={t.id} className={`pill ${activeTeamIdx === i ? "active" : ""}`}
              onClick={() => setActiveTeamIdx(i)}>{t.name}</button>
          ))}
        </div>
      )}

      {team && (
        <>
          <div
            className="card card-glow mb-2 text-center !py-6 animate-fade-in"
            style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.05), rgba(212,175,55,0.01))", borderColor: "rgba(212,175,55,0.1)" }}
          >
            <p className="text-xs font-semibold text-text-muted mb-1">{team.name}</p>
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Flag country={team.championPick} size="sm" />
              <span className="text-[10px] text-text-muted">{team.championPick}</span>
            </div>
            <p className="font-display text-[44px] font-black text-gold-light leading-none">{team.totalPoints}</p>
            <span className="badge badge-gold mt-2">#{team.currentRank} · {allParticipants.length} participantes</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {[
              { label: "Grupos", val: team.groupPoints },
              { label: "Eliminatorias", val: team.finalPhasePoints },
              { label: "Especiales", val: team.specialPoints },
            ].map((k, i) => (
              <div key={i} className="card text-center !p-3">
                <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">{k.label}</p>
                <p className="font-display text-xl font-bold text-text-primary">{k.val}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-0.5 rounded-xl p-[3px] overflow-x-auto mb-4" style={{ background: "#080B0F" }}>
            {tabs.map((t) => (
              <button key={t}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all border-none ${
                  activeTab === t.toLowerCase() ? "text-text-primary" : "text-text-muted bg-transparent"
                }`}
                style={activeTab === t.toLowerCase() ? { background: "rgba(255,255,255,0.06)" } : {}}
                onClick={() => setActiveTab(t.toLowerCase())}
              >{t}</button>
            ))}
          </div>

          <div className="animate-fade-in">
            {activeTab === "resumen" && <TabResumen team={team} />}
            {activeTab === "partidos" && <TabPartidos />}
            {activeTab === "grupos" && <TabGrupos />}
            {activeTab === "eliminatorias" && <TabEliminatorias team={team} />}
            {activeTab === "especiales" && <TabEspeciales team={team} />}
            {activeTab === "favoritos" && <EmptyState text="Aún no tienes favoritos" icon={Star} />}
          </div>
        </>
      )}
    </div>
  );
}

function TabResumen({ team }: { team: Team }) {
  const items = [
    { label: "Total", val: team.totalPoints, hi: true },
    { label: "Puntos grupos", val: team.groupPoints },
    { label: "Puntos eliminatorias", val: team.finalPhasePoints },
    { label: "Puntos especiales", val: team.specialPoints },
  ];
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} className="flex justify-between py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <span className={`text-sm ${it.hi ? "text-text-primary font-semibold" : "text-text-muted"}`}>{it.label}</span>
          <span className={`font-display text-sm ${it.hi ? "font-bold text-gold-light" : "font-semibold text-text-primary"}`}>{it.val}</span>
        </div>
      ))}
    </div>
  );
}

function TabPartidos() {
  const sample = Object.entries(GROUPS).slice(0, 3).flatMap(([g, teams], gi) => [
    { group: g, home: teams[0], away: teams[1], pick: `${gi % 3}-${(gi + 1) % 3}` },
    { group: g, home: teams[2], away: teams[3], pick: `${(gi + 1) % 2}-${gi % 2}` },
  ]);
  return (
    <div className="flex flex-col gap-1.5">
      {sample.map((f, i) => (
        <div key={i} className="card !py-2.5 !px-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <GroupBadge group={f.group} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[11px]">{f.home}</span>
              <Flag country={f.home} size="sm" />
            </div>
            <span className="font-display text-sm font-bold text-text-muted rounded-lg px-2 py-0.5"
              style={{ background: "rgba(255,255,255,0.04)" }}>{f.pick}</span>
            <div className="flex items-center gap-1">
              <Flag country={f.away} size="sm" />
              <span className="text-[11px]">{f.away}</span>
            </div>
          </div>
          <div className="text-center mt-1.5"><span className="badge badge-muted">Pendiente</span></div>
        </div>
      ))}
    </div>
  );
}

function TabGrupos() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(GROUPS).map(([g, teams]) => (
        <div key={g} className="card !p-2.5">
          <GroupBadge group={g} />
          <div className="mt-2 flex flex-col gap-1">
            {teams.map((t, i) => (
              <div key={t} className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-text-muted w-3.5">{i + 1}</span>
                <Flag country={t} size="sm" />
                <span className="text-[10px] truncate">{t}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TabEliminatorias({ team }: { team: Team }) {
  const rounds = ["Dieciseisavos", "Octavos", "Cuartos", "Semifinales", "Final"];
  const countries = ["España", "Brasil", "Argentina", "Francia", "Alemania"];
  return (
    <div className="flex flex-col gap-3">
      {rounds.map((r, ri) => (
        <div key={r}>
          <h4 className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">{r}</h4>
          <div className="flex flex-wrap gap-1">
            {(ri < 3 ? [0, 1, 2] : ri < 4 ? [0, 1] : [0]).map((pi) => {
              const c = countries[(ri + pi) % countries.length];
              return (
                <div key={pi} className="card !py-1.5 !px-2.5 flex items-center gap-1.5">
                  <Flag country={c} size="sm" />
                  <span className="text-[10px]">{c}</span>
                  <span className="badge badge-muted text-[8px]">Pendiente</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="card !p-4 text-center" style={{ borderColor: "rgba(212,175,55,0.15)", background: "rgba(212,175,55,0.02)" }}>
        <p className="text-[10px] text-gold uppercase tracking-wider font-semibold mb-3">Final pronosticada</p>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center"><Flag country={team.championPick} /><p className="text-[10px] mt-1">{team.championPick}</p></div>
          <span className="font-display text-base font-bold text-gold">vs</span>
          <div className="text-center"><Flag country="Francia" /><p className="text-[10px] mt-1">Francia</p></div>
        </div>
        <p className="text-xs font-semibold text-gold-light mt-2">Campeón: {team.championPick}</p>
      </div>
    </div>
  );
}

function TabEspeciales({ team }: { team: Team }) {
  const items = [
    { label: "Mejor Jugador", val: team.specials.mejorJugador, pts: 20 },
    { label: "Mejor Joven", val: team.specials.mejorJoven, pts: 20 },
    { label: "Máx. Goleador", val: team.specials.maxGoleador, pts: 20 },
    { label: "Máx. Asistente", val: team.specials.maxAsistente, pts: 20 },
    { label: "Mejor Portero", val: team.specials.mejorPortero, pts: 20 },
    { label: "Goleador ESP", val: team.specials.maxGoleadorEsp, pts: 10 },
    { label: "Primer Gol ESP", val: team.specials.primerGolEsp, pts: 10 },
    { label: "Revelación", val: team.specials.revelacion, pts: 10 },
    { label: "Decepción", val: team.specials.decepcion, pts: 10 },
    { label: "Min. Primer Gol", val: `${team.specials.minutoPrimerGol}'`, pts: 50 },
  ];
  return (
    <div className="flex flex-col gap-1">
      {items.map((s, i) => (
        <div key={i} className="card !py-2.5 !px-3 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-text-muted uppercase tracking-wider">{s.label}</p>
            <p className="text-sm font-semibold text-text-primary mt-0.5">{s.val}</p>
          </div>
          <div className="text-right">
            <span className="badge badge-muted">Pendiente</span>
            <p className="text-[9px] text-text-muted mt-0.5">{s.pts} pts</p>
          </div>
        </div>
      ))}
    </div>
  );
}
