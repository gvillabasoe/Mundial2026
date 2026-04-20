"use client";

import Image from "next/image";
import { GROUP_COLORS } from "@/lib/data";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

// ─── Flag emoji map ──────────────────────────────────
// All flags → emoji. Exception: Inglaterra → PNG image.

const FLAG_EMOJI: Record<string, string> = {
  "México": "🇲🇽", "Sudáfrica": "🇿🇦", "Corea del Sur": "🇰🇷", "Chequia": "🇨🇿",
  "Canadá": "🇨🇦", "Bosnia y Herzegovina": "🇧🇦", "Catar": "🇶🇦", "Suiza": "🇨🇭",
  "Brasil": "🇧🇷", "Marruecos": "🇲🇦", "Haití": "🇭🇹", "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos": "🇺🇸", "Paraguay": "🇵🇾", "Australia": "🇦🇺", "Turquía": "🇹🇷",
  "Alemania": "🇩🇪", "Curazao": "🇨🇼", "Costa de Marfil": "🇨🇮", "Ecuador": "🇪🇨",
  "Países Bajos": "🇳🇱", "Japón": "🇯🇵", "Suecia": "🇸🇪", "Túnez": "🇹🇳",
  "Bélgica": "🇧🇪", "Egipto": "🇪🇬", "Irán": "🇮🇷", "Nueva Zelanda": "🇳🇿",
  "España": "🇪🇸", "Cabo Verde": "🇨🇻", "Arabia Saudí": "🇸🇦", "Uruguay": "🇺🇾",
  "Francia": "🇫🇷", "Senegal": "🇸🇳", "Irak": "🇮🇶", "Noruega": "🇳🇴",
  "Argentina": "🇦🇷", "Argelia": "🇩🇿", "Austria": "🇦🇹", "Jordania": "🇯🇴",
  "Portugal": "🇵🇹", "RD Congo": "🇨🇩", "Uzbekistán": "🇺🇿", "Colombia": "🇨🇴",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croacia": "🇭🇷", "Ghana": "🇬🇭", "Panamá": "🇵🇦",
};

const EMOJI_SIZES: Record<string, string> = {
  sm: "text-base leading-none",
  md: "text-xl leading-none",
  lg: "text-[28px] leading-none",
};

const IMG_SIZES = { sm: 20, md: 28, lg: 36 };

export function Flag({
  country,
  size = "md",
  className = "",
}: {
  country: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  // Inglaterra → PNG (única excepción)
  if (country === "Inglaterra") {
    const px = IMG_SIZES[size];
    return (
      <Image
        src="/flags/Inglaterra.png"
        alt="Inglaterra"
        width={px}
        height={Math.round(px * 0.67)}
        className={`rounded-[3px] object-cover ${className}`}
      />
    );
  }

  const emoji = FLAG_EMOJI[country];
  if (emoji) {
    return (
      <span className={`${EMOJI_SIZES[size]} ${className}`} role="img" aria-label={country}>
        {emoji}
      </span>
    );
  }

  const px = IMG_SIZES[size];
  return (
    <span
      className={`inline-flex items-center justify-center rounded bg-bg-5 text-[9px] text-text-muted ${className}`}
      style={{ width: px, height: Math.round(px * 0.67) }}
    >
      ?
    </span>
  );
}

// ─── CountryWithFlag ─────────────────────────────────

export function CountryWithFlag({
  country,
  size = "sm",
  className = "",
}: {
  country: string;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!country) return null;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Flag country={country} size={size} />
      <span>{country}</span>
    </span>
  );
}

// ─── Group Badge ─────────────────────────────────────

export function GroupBadge({ group }: { group: string }) {
  const color = GROUP_COLORS[group] ?? "#7A8598";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase"
      style={{ background: `${color}1A`, color, border: `1px solid ${color}30` }}
    >
      Grupo {group}
    </span>
  );
}

// ─── Section Title ────────────────────────────────────

export function SectionTitle({
  children,
  accent,
  icon: Icon,
  right,
}: {
  children: React.ReactNode;
  accent?: string;
  icon?: LucideIcon;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} style={{ color: accent ?? "#D4AF37" }} />}
        <h2 className="font-display text-base font-bold tracking-tight" style={{ color: "#E8EAF0" }}>
          {children}
        </h2>
      </div>
      {right}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────

export function EmptyState({ text, icon: Icon }: { text: string; icon?: LucideIcon }) {
  return (
    <div className="card text-center py-10 text-text-muted">
      {Icon && <Icon size={28} className="mx-auto mb-2.5 opacity-30" />}
      <p className="text-sm">{text}</p>
    </div>
  );
}

// ─── DemoBadge ────────────────────────────────────────

export function DemoBadge() {
  return (
    <span className="badge badge-muted text-[9px]">Demo</span>
  );
}

// ─── Countdown ────────────────────────────────────────

export function Countdown({ target }: { target: string }) {
  const [diff, setDiff] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const t = new Date(target).getTime();
    const tick = () => {
      const rem = Math.max(0, t - Date.now());
      setDiff({
        d: Math.floor(rem / 86400000),
        h: Math.floor((rem % 86400000) / 3600000),
        m: Math.floor((rem % 3600000) / 60000),
        s: Math.floor((rem % 60000) / 1000),
      });
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [target]);

  const units = [
    { val: diff.d, label: "días" },
    { val: diff.h, label: "h" },
    { val: diff.m, label: "min" },
    { val: diff.s, label: "seg" },
  ];

  return (
    <div className="flex gap-2 justify-center">
      {units.map((u, i) => (
        <div key={i} className="text-center">
          <div
            className={`font-display text-[26px] font-black text-gold-light rounded-xl px-3 py-2 min-w-[54px] ${
              i === 3 ? "animate-count-pulse" : ""
            }`}
            style={{
              background: "rgba(212,175,55,0.06)",
              border: "1px solid rgba(212,175,55,0.12)",
            }}
          >
            {String(u.val).padStart(2, "0")}
          </div>
          <span className="text-[9px] text-text-muted mt-1 block uppercase tracking-widest">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
