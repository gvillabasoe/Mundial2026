/**
 * Team name normalization and safe flag resolution.
 *
 * The repo stores flag assets with ASCII-safe filenames so the same build works
 * cleanly in local dev, Vercel and GitHub checkouts on different file systems.
 */

import { AVAILABLE_FLAG_KEYS } from "@/lib/flag-manifest";

const ALIASES: Record<string, string[]> = {
  paises_bajos: ["paises_bajos", "holanda", "netherlands"],
  estados_unidos: ["estados_unidos", "usa", "eeuu", "us", "united_states", "united_states_of_america"],
  arabia_saudi: ["arabia_saudi", "arabia_saudita", "saudi_arabia"],
  rd_del_congo: ["rd_del_congo", "rd_congo", "dr_congo", "democratic_republic_of_the_congo", "republica_democratica_del_congo"],
  bosnia_y_herzegovina: ["bosnia_y_herzegovina", "bosnia_herzegovina", "bosnia_and_herzegovina"],
  corea_del_sur: ["corea_del_sur", "corea_sur", "corea", "south_korea", "korea_republic"],
  republica_checa: ["republica_checa", "chequia", "czechia", "czech_republic"],
  costa_de_marfil: ["costa_de_marfil", "costa_marfil", "ivory_coast", "cote_divoire"],
  catar: ["catar", "qatar"],
  irak: ["irak", "iraq"],
  turquia: ["turquia", "turkey"],
  tunez: ["tunez", "tunisia"],
  japon: ["japon", "japan"],
  nueva_zelanda: ["nueva_zelanda", "new_zealand"],
  sudafrica: ["sudafrica", "south_africa"],
  inglaterra: ["inglaterra", "england"],
};

const REVERSE_ALIASES: Record<string, string> = {};
for (const [canonical, aliases] of Object.entries(ALIASES)) {
  for (const alias of aliases) {
    REVERSE_ALIASES[alias] = canonical;
  }
}

export function normalizeTeamKey(name: string): string {
  let key = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[''´`\".,:;!?()\[\]{}]/g, "")
    .replace(/[\s\-\/\\]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  return REVERSE_ALIASES[key] || key;
}

export function getFlagForTeam(name: string): string | null {
  const key = normalizeTeamKey(name);
  return AVAILABLE_FLAG_KEYS.has(key) ? `/flags/${key}.png` : null;
}

const FLAG_EMOJI: Record<string, string> = {
  mexico: "🇲🇽",
  sudafrica: "🇿🇦",
  corea_del_sur: "🇰🇷",
  republica_checa: "🇨🇿",
  canada: "🇨🇦",
  bosnia_y_herzegovina: "🇧🇦",
  catar: "🇶🇦",
  suiza: "🇨🇭",
  brasil: "🇧🇷",
  marruecos: "🇲🇦",
  haiti: "🇭🇹",
  escocia: "🏴",
  estados_unidos: "🇺🇸",
  paraguay: "🇵🇾",
  australia: "🇦🇺",
  turquia: "🇹🇷",
  alemania: "🇩🇪",
  curazao: "🇨🇼",
  costa_de_marfil: "🇨🇮",
  ecuador: "🇪🇨",
  paises_bajos: "🇳🇱",
  japon: "🇯🇵",
  suecia: "🇸🇪",
  tunez: "🇹🇳",
  belgica: "🇧🇪",
  egipto: "🇪🇬",
  iran: "🇮🇷",
  nueva_zelanda: "🇳🇿",
  espana: "🇪🇸",
  cabo_verde: "🇨🇻",
  arabia_saudi: "🇸🇦",
  uruguay: "🇺🇾",
  francia: "🇫🇷",
  senegal: "🇸🇳",
  irak: "🇮🇶",
  noruega: "🇳🇴",
  argentina: "🇦🇷",
  argelia: "🇩🇿",
  austria: "🇦🇹",
  jordania: "🇯🇴",
  portugal: "🇵🇹",
  rd_del_congo: "🇨🇩",
  uzbekistan: "🇺🇿",
  colombia: "🇨🇴",
  inglaterra: "🏴",
  croacia: "🇭🇷",
  ghana: "🇬🇭",
  panama: "🇵🇦",
  bolivia: "🇧🇴",
  italia: "🇮🇹",
  jamaica: "🇯🇲",
  irlanda: "🇮🇪",
};

export function getFlagEmoji(name: string): string {
  const key = normalizeTeamKey(name);
  return FLAG_EMOJI[key] || "🏳️";
}
