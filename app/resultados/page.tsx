"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Flag, GroupBadge, EmptyState } from "@/components/ui";
import { FIXTURES, KNOCKOUT_ROUNDS, GROUPS } from "@/lib/data";
import { getFlagPath } from "@/lib/flags";
import type { Fixture } from "@/lib/data";

export default function ResultadosPage() {
  const [expanded, setExpanded] = useState<string | null>("j1");
  const [statusFilter, setStatusFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");

  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  const jornadaFixtures = (j: number) =>
    FIXTURES.filter((f) => f.round === `Jornada ${j}`);

  const groupedByGroup = (fixtures: Fixture[]) => {
    const groups: Record<string, Fixture[]> = {};
    fixtures.forEach((f) => {
      const g = f.group ?? "?";
      if (!groups[g]) groups[g] = [];
      groups[g].push(f);
    });
    return groups;
  };

  const showGroups = phaseFilter === "all" || phaseFilter === "groups";
  const showKO = phaseFilter === "all" || phaseFilter === "ko";

  return (
    <div className="px-4 pt-5 max-w-[640px] mx-auto">
      <div className="animate-fade-in mb-5">
        <h1 className="font-display text-2xl font-black tracking-tight" style={{ color: "#E8EAF0" }}>
          Resultados
        </h1>
      </div>

      {/* Status Filters */}
      <div className="flex gap-1.5 mb-2.5 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Todos" },
          { key: "ns", label: "Programados" },
          { key: "live", label: "En directo" },
          { key: "ft", label: "Finalizados" },
        ].map((f) => (
          <button
            key={f.key}
            className={`pill ${statusFilter === f.key ? "active" : ""}`}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Phase Filters */}
      <div className="flex gap-1.5 mb-4">
        {[
          { key: "all", label: "Todos" },
          { key: "groups", label: "Grupos" },
          { key: "ko", label: "Eliminatorias" },
        ].map((f) => (
          <button
            key={f.key}
            className={`pill ${phaseFilter === f.key ? "active" : ""}`}
            onClick={() => setPhaseFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Group Jornadas */}
      {showGroups &&
        [1, 2, 3].map((j) => {
          const key = `j${j}`;
          const open = expanded === key;
          const fixtures = jornadaFixtures(j);
          const grouped = groupedByGroup(fixtures);

          return (
            <div key={key} className="mb-2 animate-fade-in">
              <button
                onClick={() => toggle(key)}
                className="flex items-center justify-between w-full py-3 px-3.5 rounded-xl cursor-pointer text-text-primary transition-all"
                style={{
                  background: "#0A0D12",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span className="font-display text-[14px] font-bold">
                  Fase de Grupos — Jornada {j}
                </span>
                {open ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
              </button>
              {open && (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {Object.entries(grouped).map(([g, matches]) => (
                    <div key={g}>
                      <div className="mb-1 mt-1 px-1">
                        <GroupBadge group={g} />
                      </div>
                      {matches.map((m) => (
                        <MatchCard key={m.id} match={m} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {/* Knockout Rounds */}
      {showKO &&
        KNOCKOUT_ROUNDS.map((round, ri) => {
          const key = `ko${ri}`;
          const open = expanded === key;
          const isFinal = round.name === "Final";

          return (
            <div key={key} className="mb-2 animate-fade-in">
              <button
                onClick={() => toggle(key)}
                className="flex items-center justify-between w-full py-3 px-3.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isFinal ? "rgba(212,175,55,0.05)" : "#0A0D12",
                  border: isFinal
                    ? "1px solid rgba(212,175,55,0.2)"
                    : "1px solid rgba(255,255,255,0.06)",
                  color: isFinal ? "#E8C84A" : "#E8EAF0",
                }}
              >
                <span className="font-display text-[14px] font-bold">{round.name}</span>
                {open ? <ChevronUp size={16} className="opacity-60" /> : <ChevronDown size={16} className="opacity-60" />}
              </button>
              {open && (
                <div className="mt-1.5 flex flex-col gap-1">
                  {round.matches.map((m, mi) => (
                    <KnockoutCard key={mi} matchStr={m} isFinal={isFinal} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

function MatchCard({ match }: { match: Fixture }) {
  const kickoff = new Date(match.kickoff);
  const timeStr = kickoff.toLocaleTimeString("es-ES", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid",
  });
  const dateStr = kickoff.toLocaleDateString("es-ES", {
    day: "numeric", month: "short", timeZone: "Europe/Madrid",
  });

  return (
    <div className="card !py-2.5 !px-3 mb-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="badge badge-green text-[9px]">
          <Clock size={9} /> {dateStr} · {timeStr}
        </span>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 text-right flex items-center justify-end gap-1.5">
          <span className="text-xs font-medium">{match.homeTeam}</span>
          <Flag country={match.homeTeam} size="sm" />
        </div>
        <div
          className="font-display text-sm font-bold rounded-lg px-2.5 py-1 min-w-[48px] text-center"
          style={{ background: "rgba(255,255,255,0.04)", color: "#4A5366" }}
        >
          vs
        </div>
        <div className="flex-1 text-left flex items-center gap-1.5">
          <Flag country={match.awayTeam} size="sm" />
          <span className="text-xs font-medium">{match.awayTeam}</span>
        </div>
      </div>
    </div>
  );
}

function KnockoutCard({ matchStr, isFinal }: { matchStr: string; isFinal: boolean }) {
  const [home, away] = matchStr.split(" vs ");
  const hasHomeFlag = !!getFlagPath(home);
  const hasAwayFlag = !!getFlagPath(away);

  return (
    <div
      className="card !py-2.5 !px-3"
      style={{
        border: isFinal ? "1px solid rgba(212,175,55,0.15)" : undefined,
        background: isFinal ? "rgba(212,175,55,0.02)" : undefined,
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 text-right flex items-center justify-end gap-1.5">
          <span className={`text-xs font-medium ${!hasHomeFlag ? "text-text-muted" : ""}`}>
            {home}
          </span>
          {hasHomeFlag && <Flag country={home} size="sm" />}
        </div>
        <div
          className="font-display text-sm font-bold rounded-lg px-2.5 py-1 min-w-[48px] text-center"
          style={{
            background: isFinal ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.04)",
            color: isFinal ? "#E8C84A" : "#4A5366",
          }}
        >
          vs
        </div>
        <div className="flex-1 text-left flex items-center gap-1.5">
          {hasAwayFlag && <Flag country={away} size="sm" />}
          <span className={`text-xs font-medium ${!hasAwayFlag ? "text-text-muted" : ""}`}>
            {away}
          </span>
        </div>
      </div>
      {(!hasHomeFlag || !hasAwayFlag) && (
        <p className="text-center text-[9px] text-text-muted mt-1">Por definir</p>
      )}
    </div>
  );
}
