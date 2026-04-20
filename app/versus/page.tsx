"use client";

import { useState } from "react";
import { Lock, Swords, Clock } from "lucide-react";
import { Flag, GroupBadge, EmptyState } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";
import { PARTICIPANTS, GROUPS } from "@/lib/data";
import Link from "next/link";

export default function VersusPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"general" | "participante">("general");
  const [rivalId, setRivalId] = useState<string>("");
  const [vsTab, setVsTab] = useState("resumen");
  const [vsFilter, setVsFilter] = useState("all");

  if (!user) {
    return (
      <div className="px-4 flex items-center justify-center min-h-[70vh]">
        <div className="card text-center !p-8 max-w-[300px] animate-fade-in">
          <Lock size={32} className="mx-auto mb-3" style={{ color: "#F0417A" }} />
          <h2 className="font-display text-lg font-bold text-text-primary mb-2">
            Acceso restringido
          </h2>
          <p className="text-sm text-text-muted mb-5">Inicia sesión para continuar</p>
          <Link href="/mi-club" className="btn no-underline w-full" style={{ background: "#F0417A", color: "white" }}>
            Entrar a Mi Club
          </Link>
        </div>
      </div>
    );
  }

  const userTeams = PARTICIPANTS.filter((p) => p.userId === user.id);
  const baseTeam = userTeams[0];
  const otherTeams = PARTICIPANTS.filter((p) => p.userId !== user.id);
  const rival = mode === "participante" ? otherTeams.find((t) => t.id === rivalId) || otherTeams[0] : null;

  const consensus = {
    name: "Consenso",
    username: "General",
    totalPoints: Math.round(PARTICIPANTS.reduce((a, p) => a + p.totalPoints, 0) / PARTICIPANTS.length),
    groupPoints: Math.round(PARTICIPANTS.reduce((a, p) => a + p.groupPoints, 0) / PARTICIPANTS.length),
    finalPhasePoints: Math.round(PARTICIPANTS.reduce((a, p) => a + p.finalPhasePoints, 0) / PARTICIPANTS.length),
    specialPoints: Math.round(PARTICIPANTS.reduce((a, p) => a + p.specialPoints, 0) / PARTICIPANTS.length),
  };

  const ref = mode === "general" ? consensus : rival;
  const equalPct = mode === "general" ? 42 : 34;
  const diffCount = Math.floor((100 - equalPct) * 0.6);
  const pointDelta = baseTeam && ref ? baseTeam.totalPoints - ref.totalPoints : 0;

  const vsTabs = ["Resumen", "Grupos", "Eliminatorias", "Final", "Podio", "Especiales"];
  const vsFilters = [
    { key: "all", label: "Todo" },
    { key: "diff", label: "Diferencias" },
    { key: "same", label: "Coincidencias" },
  ];

  const accent = (active: boolean) =>
    active
      ? { background: "rgba(240,65,122,0.12)", color: "#F0417A", borderColor: "rgba(240,65,122,0.3)" }
      : {};

  return (
    <div className="px-4 pt-5 max-w-[640px] mx-auto">
      <div className="animate-fade-in mb-5">
        <h1 className="font-display text-2xl font-black tracking-tight" style={{ color: "#E8EAF0" }}>
          Versus
        </h1>
      </div>

      {/* Base team */}
      {baseTeam && (
        <div
          className="card flex items-center gap-3 mb-3 animate-fade-in"
          style={{ borderLeft: "3px solid #F0417A" }}
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">{baseTeam.name}</p>
            <p className="text-[10px] text-text-muted">@{user.username} · #{baseTeam.currentRank}</p>
          </div>
          <span className="font-display text-xl font-bold" style={{ color: "#F0417A" }}>
            {baseTeam.totalPoints}
          </span>
        </div>
      )}

      {/* Mode selector */}
      <div className="flex gap-1.5 mb-3">
        <button className="pill" style={accent(mode === "general")} onClick={() => setMode("general")}>
          General
        </button>
        <button className="pill" style={accent(mode === "participante")} onClick={() => setMode("participante")}>
          Participante
        </button>
      </div>

      {/* Rival selector */}
      {mode === "participante" && (
        <div className="mb-3">
          <label className="text-[10px] text-text-muted uppercase tracking-wider mb-1 block">Rival</label>
          <select className="input-field cursor-pointer" value={rivalId} onChange={(e) => setRivalId(e.target.value)}>
            <option value="">Seleccionar...</option>
            {otherTeams.map((t) => (
              <option key={t.id} value={t.id}>{t.name} (@{t.username})</option>
            ))}
          </select>
        </div>
      )}

      {/* Duel summary */}
      {ref && baseTeam && (
        <div
          className="card mb-3 animate-fade-in"
          style={{ background: "rgba(240,65,122,0.03)", border: "1px solid rgba(240,65,122,0.1)" }}
        >
          <p className="font-display text-sm font-bold text-text-primary mb-2.5">Resumen</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "% iguales", val: `${equalPct}%`, color: "#F0417A" },
              { label: "Picks distintos", val: String(diffCount), color: "#D0D4DC" },
              {
                label: "Diferencia",
                val: `${pointDelta >= 0 ? "+" : ""}${pointDelta}`,
                color: pointDelta >= 0 ? "#27E6AC" : "#FF7AA5",
              },
              { label: "Mayor diferencia", val: "Especiales", color: "#D0D4DC" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl text-center"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <p className="text-[9px] text-text-muted uppercase tracking-wider mb-0.5">{item.label}</p>
                <p className="font-display text-[20px] font-bold" style={{ color: item.color }}>
                  {i === 3 ? "" : item.val}
                </p>
                {i === 3 && <p className="text-xs font-semibold">{item.val}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 mb-3 flex-wrap">
        {[
          { color: "#27E6AC", label: "Acierto" },
          { color: "#FF7AA5", label: "Fallo" },
          { color: "#DFBE38", label: "Pendiente" },
          { color: "#F0417A", label: "Diferencia" },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
            <span className="text-[10px] text-text-muted">{l.label}</span>
          </div>
        ))}
      </div>

      {/* VS Tabs */}
      <div className="flex gap-0.5 rounded-xl p-[3px] overflow-x-auto mb-2.5" style={{ background: "#080B0F" }}>
        {vsTabs.map((t) => (
          <button
            key={t}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all border-none ${
              vsTab === t.toLowerCase() ? "text-text-primary" : "text-text-muted bg-transparent"
            }`}
            style={vsTab === t.toLowerCase() ? { background: "rgba(255,255,255,0.06)" } : {}}
            onClick={() => setVsTab(t.toLowerCase())}
          >
            {t}
          </button>
        ))}
      </div>

      {/* VS Filters */}
      <div className="flex gap-1.5 mb-4">
        {vsFilters.map((f) => (
          <button key={f.key} className="pill" style={accent(vsFilter === f.key)} onClick={() => setVsFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* VS Content */}
      {vsTab === "resumen" && ref && baseTeam && (
        <div className="flex flex-col gap-1.5 animate-fade-in">
          {[
            { label: "Grupos", baseVal: baseTeam.groupPoints, refVal: ref.groupPoints },
            { label: "Eliminatorias", baseVal: baseTeam.finalPhasePoints, refVal: ref.finalPhasePoints },
            { label: "Especiales", baseVal: baseTeam.specialPoints, refVal: ref.specialPoints },
          ].map((section, si) => {
            const delta = section.baseVal - section.refVal;
            return (
              <div key={si} className="card !py-3 !px-3.5">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">{section.label}</p>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-[9px] text-text-muted">{baseTeam.name}</p>
                    <p className="font-display text-xl font-bold text-text-primary">{section.baseVal}</p>
                  </div>
                  <span
                    className="font-display text-sm font-bold px-2.5 py-0.5 rounded-lg"
                    style={{
                      background: delta > 0 ? "rgba(39,230,172,0.08)" : delta < 0 ? "rgba(255,122,165,0.08)" : "rgba(255,255,255,0.04)",
                      color: delta > 0 ? "#27E6AC" : delta < 0 ? "#FF7AA5" : "#4A5366",
                    }}
                  >
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                  <div className="text-center">
                    <p className="text-[9px] text-text-muted">{mode === "general" ? "Consenso" : ref.name}</p>
                    <p className="font-display text-xl font-bold text-text-primary">{section.refVal}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {vsTab === "grupos" && (
        <div className="flex flex-col gap-1.5 animate-fade-in">
          {Object.entries(GROUPS).slice(0, 4).map(([g, teams]) => (
            <div key={g} className="card !p-3">
              <GroupBadge group={g} />
              <div className="mt-2">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-1 items-center">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-center" style={{ color: "#F0417A" }}>Tu pick</p>
                  <p className="text-[9px] text-text-muted text-center w-5">Pos.</p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-text-muted text-center">
                    {mode === "general" ? "Consenso" : "Rival"}
                  </p>
                </div>
                {teams.map((t, i) => {
                  const same = i % 2 === 0;
                  const otherTeam = teams[(i + (same ? 0 : 1)) % 4];
                  return (
                    <div
                      key={t}
                      className="grid grid-cols-[1fr_auto_1fr] gap-1 items-center py-1.5 border-t"
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}
                    >
                      <div className="flex items-center gap-1 justify-center">
                        <Flag country={t} size="sm" />
                        <span className="text-[10px] truncate">{t}</span>
                      </div>
                      <span className="text-[10px] font-bold text-text-muted w-5 text-center">{i + 1}</span>
                      <div className="flex items-center gap-1 justify-center">
                        <Flag country={otherTeam} size="sm" />
                        <span className="text-[10px] truncate">{otherTeam}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {["eliminatorias", "final", "podio", "especiales"].includes(vsTab) && (
        <EmptyState text="Pendiente — Disponible cuando avance el torneo" icon={Clock} />
      )}
    </div>
  );
}
