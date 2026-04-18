"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { AlertCircle, RefreshCw, TrendingUp, Wifi, WifiOff } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Image from "next/image";
import { Flag, SectionTitle } from "@/components/ui";
import { FEATURED_TEAM_BY_NAME, FEATURED_TEAMS } from "@/lib/probabilities/team-config";

interface ProbabilityRankingItem {
  teamName: string;
  probability01: number;
  probabilityPct: number;
  featured: boolean;
  color?: string;
}

interface ProbabilityResponse {
  source: "polymarket";
  updatedAt: string;
  stale: boolean;
  marketMode: "multi" | "binary" | "mixed" | "unknown";
  marketLabel: string | null;
  featured: Record<string, number | null>;
  ranking: ProbabilityRankingItem[];
  error?: string;
}

interface HistoryPoint {
  label: string;
  stamp: string;
  [key: string]: string | number | null;
}

const fetcher = async (url: string): Promise<ProbabilityResponse> => {
  const response = await fetch(url, { cache: "no-store" });
  return response.json();
};

function formatProbability(value: number | null | undefined) {
  if (value == null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function renderProbabilityWithPercent(value: number | null | undefined) {
  if (value == null) return "—";
  return `${formatProbability(value)}%`;
}

export default function ProbabilidadesPage() {
  const { data, error, isLoading, mutate } = useSWR<ProbabilityResponse>("/api/probabilities", fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });

  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const lastStampRef = useRef<string | null>(null);

  useEffect(() => {
    if (!data?.updatedAt || !data.ranking.length) return;
    if (lastStampRef.current === data.updatedAt) return;
    lastStampRef.current = data.updatedAt;

    const label = new Date(data.updatedAt).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const point: HistoryPoint = {
      stamp: data.updatedAt,
      label,
    };

    FEATURED_TEAMS.forEach((team) => {
      point[team.teamKey] = data.featured[team.teamName] ?? null;
    });

    setHistory((prev) => {
      const next = [...prev, point];
      return next.length > 24 ? next.slice(-24) : next;
    });
  }, [data]);

  const featured = useMemo(() => {
    return FEATURED_TEAMS.map((team) => ({
      ...team,
      probabilityPct: data?.featured?.[team.teamName] ?? null,
    }));
  }, [data]);

  const heroTeam = featured[0];
  const others = featured.slice(1);
  const hasRanking = Boolean(data?.ranking?.length);
  const topProbability = data?.ranking?.[0]?.probabilityPct || 1;

  const state = isLoading && !data
    ? "loading"
    : hasRanking
      ? data?.stale
        ? "stale"
        : "ok"
      : "empty";

  return (
    <div className="mx-auto max-w-[640px] px-4 pt-4">
      <div className="page-header animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-bg-4">
            <Image src="/Logo_Porra_Mundial_2026.webp" alt="Peñita Mundial" width={40} height={40} className="object-contain" />
          </div>
          <div>
            <h1 className="page-header__title">Probabilidades</h1>
            <p className="page-header__subtitle">Mercado en vivo · Polymarket</p>
          </div>
        </div>
        {state === "ok" ? (
          <span className="badge badge-green"><Wifi size={12} /> En vivo</span>
        ) : state === "stale" ? (
          <span className="badge badge-amber"><AlertCircle size={12} /> Retrasado</span>
        ) : (
          <span className="badge badge-muted"><WifiOff size={12} /> Sin datos</span>
        )}
      </div>

      {state === "loading" ? (
        <div className="card animate-pulse">
          <div className="mb-4 h-5 w-40 rounded bg-white/10" />
          <div className="mb-3 h-14 w-48 rounded bg-white/10" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-24 rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      ) : null}

      {!hasRanking ? (
        <div className="card animate-fade-in text-center py-8">
          <AlertCircle size={30} className="mx-auto mb-2 opacity-40" />
          <p className="mb-1 text-sm text-text-warm">Datos no disponibles</p>
          <p className="mb-3 text-xs text-text-muted">{data?.error || error?.message || "Polymarket no ha devuelto mercados válidos todavía."}</p>
          <button type="button" className="btn btn-ghost" onClick={() => void mutate()}>
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      ) : null}

      {hasRanking && heroTeam ? (
        <div className="card card-glow mb-3 animate-fade-in bg-gradient-to-br from-bg-4 to-bg-2" style={{ borderLeft: "4px solid #C1121F" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C1121F]/20 bg-[#C1121F]/10">
              <Flag country={heroTeam.teamName} size="lg" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C1121F]">Selección destacada</p>
              <p className="mb-1 text-xs text-text-muted">Probabilidad implícita de ganar el Mundial</p>
              <p className="font-display text-[50px] font-black leading-none text-text-warm">
                {formatProbability(heroTeam.probabilityPct)}
                {heroTeam.probabilityPct != null ? <span className="text-2xl text-text-muted">%</span> : null}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-text-muted">
            <span>Actualizado: {data ? new Date(data.updatedAt).toLocaleTimeString("es-ES") : "—"}</span>
            {data?.marketLabel ? (
              <span className="badge badge-muted">
                {data.marketMode === "multi" ? "Mercado global" : data.marketMode === "binary" ? "Mercados por equipo" : "Modo mixto"}
              </span>
            ) : null}
            {data?.stale ? <span className="badge badge-amber">datos retrasados</span> : null}
          </div>
        </div>
      ) : null}

      {hasRanking && others.length ? (
        <div className="mb-4 grid grid-cols-3 gap-2 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          {others.map((team) => {
            const isGermany = team.teamName === "Alemania";
            return (
              <div key={team.teamKey} className="card !p-3 text-center">
                <div className="mb-1.5 flex justify-center">
                  <Flag country={team.teamName} size="md" />
                </div>
                <p className="font-display text-[22px] font-extrabold" style={{ color: isGermany ? "#D1D5DB" : team.color }}>
                  {renderProbabilityWithPercent(team.probabilityPct)}
                </p>
                <p className="truncate text-[10px] text-text-muted">{team.teamName}</p>
              </div>
            );
          })}
        </div>
      ) : null}

      {hasRanking && history.length > 1 ? (
        <div className="mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <SectionTitle icon={TrendingUp} accent="#D4AF37">Evolución reciente</SectionTitle>
          <div className="card !p-3">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={history}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#98A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#98A3B8" }} axisLine={false} tickLine={false} width={30} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{ background: "#0D1014", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#F6F7FB" }}
                  labelStyle={{ color: "#98A3B8", fontSize: 11 }}
                  formatter={(value, name) => {
                    const key = String(name ?? "");
                    const team = FEATURED_TEAMS.find((item) => item.teamKey === key);
                    const displayValue = value == null ? "—" : Array.isArray(value) ? value.join(" - ") : `${value}%`;
                    return [displayValue, team?.teamName || key] as [string, string];
                  }}
                />
                {FEATURED_TEAMS.map((team) => (
                  <Line
                    key={team.teamKey}
                    type="monotone"
                    dataKey={team.teamKey}
                    stroke={team.teamName === "Alemania" ? "#D1D5DB" : team.color}
                    strokeWidth={team.isPrimary ? 3 : 2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {FEATURED_TEAMS.map((team) => (
                <span key={team.teamKey} className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                  <span className="inline-block h-[3px] w-3 rounded-full" style={{ background: team.teamName === "Alemania" ? "#D1D5DB" : team.color }} />
                  {team.teamName}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {hasRanking && data?.ranking?.length ? (
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <SectionTitle icon={TrendingUp} accent="#D4AF37">Ranking completo</SectionTitle>
          <div className="card !p-3 space-y-2">
            {data.ranking.map((item, index) => {
              const config = FEATURED_TEAM_BY_NAME[item.teamName];
              const fillColor = item.teamName === "Alemania" ? "#D1D5DB" : config?.color || "#D4AF37";
              const isSpain = item.teamName === "España";
              return (
                <div key={`${item.teamName}-${index}`} className="rounded-xl px-3 py-2" style={{ borderLeft: isSpain ? "3px solid #C1121F" : "3px solid transparent", background: isSpain ? "rgba(193,18,31,0.04)" : "rgba(255,255,255,0.02)" }}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="min-w-[18px] font-display text-sm font-black text-text-muted">{index + 1}</span>
                    <Flag country={item.teamName} size="sm" />
                    <span className={`text-xs font-semibold ${isSpain ? "text-text-warm" : "text-text-primary"}`}>{item.teamName}</span>
                    <span className="ml-auto font-display text-sm font-bold" style={{ color: fillColor }}>{formatProbability(item.probabilityPct)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full border border-white/5 bg-white/6">
                    <div className="h-full rounded-full" style={{ width: `${Math.max(6, (item.probabilityPct / topProbability) * 100)}%`, background: fillColor }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="status-note mt-3 text-text-muted">Fuente: Polymarket. Los porcentajes reflejan probabilidades implícitas del mercado y no cuotas oficiales.</p>
        </div>
      ) : null}
    </div>
  );
}
