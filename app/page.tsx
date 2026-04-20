"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, ChevronRight, Zap, Activity } from "lucide-react";
import { Flag, Countdown, SectionTitle } from "@/components/ui";
import { PARTICIPANTS, MINI_POLL, ACTIVITY } from "@/lib/data";

export default function HomePage() {
  const [pollVote, setPollVote] = useState<string | null>(null);
  const top3 = PARTICIPANTS.slice(0, 3);
  const medalColors = ["#D4AF37", "#C0C0C0", "#CD7F32"];
  const medalBg = [
    "rgba(212,175,55,0.07)",
    "rgba(192,192,192,0.05)",
    "rgba(205,127,50,0.05)",
  ];
  const totalVotes = Object.values(MINI_POLL.votes).reduce((a, b) => a + b, 0);

  return (
    <div className="px-4 pt-3 max-w-[640px] mx-auto">
      {/* Header */}
      <div className="text-center mb-7 pt-1 animate-fade-in">
        <h1 className="font-display text-[30px] font-black tracking-tight" style={{ color: "#EEF0F5" }}>
          Peñita Mundial
        </h1>
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mt-0.5" style={{ color: "#D4AF37" }}>
          IV Edición · 2026
        </p>
      </div>

      {/* Countdown */}
      <div
        className="card card-glow mb-5 text-center animate-fade-in"
        style={{ background: "linear-gradient(135deg, #0D1014, #080B0F)", borderColor: "rgba(212,175,55,0.1)" }}
      >
        <p className="text-[9px] text-text-muted uppercase tracking-[0.18em] mb-3">
          Primer partido
        </p>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flag country="México" size="sm" />
          <span className="text-xs font-semibold text-text-muted mx-1">vs</span>
          <Flag country="Sudáfrica" size="sm" />
        </div>
        <p className="text-sm font-semibold text-text-primary mb-0.5">México · Sudáfrica</p>
        <p className="text-[10px] text-gold mb-4">11 jun 2026 · 21:00 Madrid</p>
        <Countdown target="2026-06-11T19:00:00Z" />
      </div>

      {/* Podium */}
      <div className="mb-5 animate-fade-in" style={{ animationDelay: "0.08s" }}>
        <SectionTitle icon={Trophy} accent="#D4AF37">Top 3</SectionTitle>
        <div className="flex flex-col gap-1">
          {top3.map((p, i) => (
            <div
              key={p.id}
              className="card flex items-center gap-3 !py-3 !px-3.5"
              style={{
                background: medalBg[i],
                borderLeft: `3px solid ${medalColors[i]}`,
              }}
            >
              <span
                className="font-display text-[22px] font-black min-w-[28px]"
                style={{ color: medalColors[i] }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{p.name}</p>
                <p className="text-[10px] text-text-muted">@{p.username}</p>
              </div>
              <span className="font-display text-lg font-bold" style={{ color: medalColors[i] }}>
                {p.totalPoints}
                <span className="text-[10px] font-normal ml-0.5 text-text-muted">pts</span>
              </span>
            </div>
          ))}
        </div>
        <Link href="/clasificacion" className="btn btn-ghost w-full mt-2.5 text-sm no-underline">
          Ranking completo <ChevronRight size={15} />
        </Link>
      </div>

      {/* Mini Porra */}
      <div className="mb-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <SectionTitle icon={Zap} accent="#DFBE38">Encuesta</SectionTitle>
        <div
          className="card"
          style={{ borderColor: "rgba(223,190,56,0.1)" }}
        >
          <p className="text-sm font-semibold mb-3 text-text-primary">{MINI_POLL.title}</p>
          <div className="flex flex-col gap-1.5">
            {MINI_POLL.options.map((opt) => {
              const pct = Math.round(((MINI_POLL.votes[opt] || 0) / totalVotes) * 100);
              const voted = pollVote === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setPollVote(opt)}
                  className="relative flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-left w-full text-sm transition-all duration-200"
                  style={{
                    border: voted ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.05)",
                    background: voted ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.02)",
                  }}
                >
                  {pollVote && (
                    <div
                      className="absolute left-0 top-0 bottom-0 rounded-xl transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: voted ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.02)",
                      }}
                    />
                  )}
                  <span className="relative flex-1" style={{ fontWeight: voted ? 600 : 400 }}>
                    {opt}
                  </span>
                  {pollVote && (
                    <span className="relative text-xs text-text-muted font-semibold">{pct}%</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="animate-fade-in mb-4" style={{ animationDelay: "0.22s" }}>
        <SectionTitle icon={Activity} accent="#4A5366">Actividad</SectionTitle>
        <div className="flex flex-col">
          {ACTIVITY.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-xs text-text-muted">{a.text}</p>
              <span className="text-[10px] text-text-muted/40 whitespace-nowrap ml-2">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
