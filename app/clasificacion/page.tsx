"use client";

import { useState, useMemo, useEffect } from "react";
import { BarChart3, Star, X, Search } from "lucide-react";
import { Flag, GroupBadge, CountryWithFlag, EmptyState } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { PARTICIPANTS } from "@/lib/data";
import { hasAdminResults, loadAdminResults } from "@/lib/admin-store";
import { recalculateAllParticipants } from "@/lib/scoring-engine";
import type { Team } from "@/lib/data";

export default function ClasificacionPage() {
  const { user, favorites, toggleFavorite } = useAuth();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [participants, setParticipants] = useState<Team[]>(PARTICIPANTS);

  useEffect(() => {
    if (hasAdminResults()) {
      const adminResults = loadAdminResults();
      setParticipants(recalculateAllParticipants([...PARTICIPANTS], adminResults));
    }
  }, []);

  const filtered = useMemo(() => {
    let list = [...participants];
    if (filter === "mine" && user) list = list.filter((p) => p.userId === user.id);
    else if (filter === "top10") list = list.slice(0, 10);
    else if (filter === "tied") {
      const c: Record<number, number> = {};
      participants.forEach((p) => { c[p.totalPoints] = (c[p.totalPoints] || 0) + 1; });
      list = list.filter((p) => c[p.totalPoints] > 1);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, user, search, participants]);

  const mc = (r: number) =>
    r === 1 ? "#D4AF37" : r === 2 ? "#C0C0C0" : r === 3 ? "#CD7F32" : null;

  return (
    <div className="px-4 pt-5 max-w-[640px] mx-auto">
      <div className="animate-fade-in mb-5">
        <h1 className="font-display text-2xl font-black tracking-tight" style={{ color: "#E8EAF0" }}>
          Ranking
        </h1>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          className="input-field !pl-9"
          placeholder="Buscar equipo o jugador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Todos" },
          { key: "mine", label: "Mis equipos" },
          { key: "top10", label: "Top 10" },
          { key: "tied", label: "Empatados" },
        ].map((f) => (
          <button
            key={f.key}
            className={`pill ${filter === f.key ? "active" : ""}`}
            onClick={() => {
              if (f.key === "mine" && !user) return;
              setFilter(f.key);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState text="Sin resultados" icon={BarChart3} />
      ) : (
        <div className="flex flex-col gap-1">
          {filtered.map((p, idx) => {
            const medal = mc(p.currentRank);
            const isMine = user && p.userId === user.id;
            const isFav = favorites.includes(p.id);
            return (
              <div
                key={p.id}
                className="card flex items-center gap-3 !py-3 !px-3.5 cursor-pointer animate-fade-in"
                style={{
                  animationDelay: `${idx * 0.018}s`,
                  borderLeft: medal
                    ? `3px solid ${medal}`
                    : isMine
                    ? "3px solid rgba(107,191,120,0.7)"
                    : "3px solid transparent",
                  background: isMine ? "rgba(107,191,120,0.03)" : undefined,
                }}
                onClick={() => setSelectedTeam(p)}
              >
                <span
                  className="font-display text-[15px] font-extrabold min-w-[22px] text-center"
                  style={{ color: medal ?? "#4A5366" }}
                >
                  {p.currentRank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{p.name}</p>
                  <p className="text-[10px] text-text-muted">@{p.username}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span
                      className="font-display text-base font-bold"
                      style={{ color: medal ?? "#D0D4DC" }}
                    >
                      {p.totalPoints}
                    </span>
                    <span className="text-[9px] text-text-muted ml-0.5">pts</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) return;
                      toggleFavorite(p.id);
                    }}
                    className="p-1 bg-transparent border-none cursor-pointer"
                  >
                    {isFav ? (
                      <Star size={13} fill="#D4AF37" color="#D4AF37" />
                    ) : (
                      <Star size={13} color="#3A4255" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTeam && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setSelectedTeam(null)}
        >
          <div
            className="rounded-t-[22px] w-full max-w-[640px] max-h-[88vh] overflow-y-auto p-5 animate-slide-up"
            style={{ background: "#0C0F14", border: "1px solid rgba(255,255,255,0.06)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-8 h-1 rounded-full bg-white/15 mx-auto mb-5" />
            <ParticipantDetail team={selectedTeam} onClose={() => setSelectedTeam(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipantDetail({ team, onClose }: { team: Team; onClose: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-xl font-black tracking-tight" style={{ color: "#E8EAF0" }}>
            {team.name}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">@{team.username}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl p-2 cursor-pointer text-text-muted hover:text-text-primary transition-colors bg-transparent border-none"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <X size={17} />
        </button>
      </div>

      {/* Total */}
      <div
        className="rounded-2xl text-center py-5 mb-4"
        style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))", border: "1px solid rgba(212,175,55,0.12)" }}
      >
        <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Puntos totales</p>
        <p className="font-display text-5xl font-black text-gold-light">{team.totalPoints}</p>
        <span className="badge badge-gold mt-2">#{team.currentRank}</span>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Grupos", val: team.groupPoints, color: "#27E6AC" },
          { label: "Eliminatorias", val: team.finalPhasePoints, color: "#E8C84A" },
          { label: "Especiales", val: team.specialPoints, color: "#F0417A" },
        ].map((k, i) => (
          <div key={i} className="card text-center !p-3">
            <p className="text-[9px] text-text-muted uppercase tracking-wider mb-1">{k.label}</p>
            <p className="font-display text-2xl font-bold" style={{ color: k.color }}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Picks */}
      <div className="flex gap-2 mb-4">
        <div className="card flex-1 flex items-center gap-2.5">
          <Flag country={team.championPick} size="md" />
          <div>
            <p className="text-[9px] text-text-muted uppercase tracking-wider">Campeón</p>
            <p className="text-sm font-semibold text-text-primary">{team.championPick}</p>
          </div>
        </div>
        <div className="card flex-1 flex items-center gap-2.5">
          <Flag country={team.subcampeonPick} size="md" />
          <div>
            <p className="text-[9px] text-text-muted uppercase tracking-wider">Subcampeón</p>
            <p className="text-sm font-semibold text-text-primary">{team.subcampeonPick}</p>
          </div>
        </div>
      </div>

      {/* Specials */}
      <h4 className="text-[10px] text-text-muted uppercase tracking-widest mb-2">Picks especiales</h4>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: "Mejor Jugador", val: team.specials.mejorJugador },
          { label: "Mejor Joven", val: team.specials.mejorJoven },
          { label: "Máx. Goleador", val: team.specials.maxGoleador },
          { label: "Máx. Asistente", val: team.specials.maxAsistente },
          { label: "Mejor Portero", val: team.specials.mejorPortero },
          { label: "Goleador ESP", val: team.specials.maxGoleadorEsp },
          { label: "Revelación", val: team.specials.revelacion, isC: true },
          { label: "Decepción", val: team.specials.decepcion, isC: true },
        ].map((s, i) => (
          <div key={i} className="py-2 px-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">{s.label}</p>
            <p className="text-xs font-semibold text-text-primary">
              {s.isC ? <CountryWithFlag country={s.val} size="sm" /> : s.val}
            </p>
          </div>
        ))}
      </div>
      <div className="py-2 px-2.5 rounded-xl mt-1.5" style={{ background: "rgba(255,255,255,0.03)" }}>
        <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">Min. primer gol</p>
        <p className="text-xs font-semibold text-text-primary">{team.specials.minutoPrimerGol}&apos;</p>
      </div>
    </div>
  );
}
