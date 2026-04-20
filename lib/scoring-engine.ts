import { SCORING, type Team } from "./data";
import type { AdminResults } from "./admin-store";

export interface CalculatedPoints {
  groupPoints: number;
  finalPhasePoints: number;
  specialPoints: number;
  totalPoints: number;
}

export function calculateTeamPoints(
  team: Team,
  results: AdminResults
): CalculatedPoints {
  let groupPoints = 0;
  let finalPhasePoints = 0;
  let specialPoints = 0;

  // ── GRUPO: posición exacta ──────────────────────────
  for (const [group, actualOrder] of Object.entries(results.groups)) {
    const picks = team.groupOrderPicks?.[group] ?? [];
    for (let pos = 0; pos < 4; pos++) {
      if (picks[pos] && picks[pos] === actualOrder[pos]) {
        groupPoints += SCORING.posicionGrupo;
      }
    }
  }

  // ── ELIMINATORIAS ───────────────────────────────────
  // REGLA: solo importa que el equipo esté en esa ronda,
  // sin importar por qué lado o cómo llegó.
  const koRounds: Array<{
    picks: string[];
    actual: string[];
    pts: number;
  }> = [
    {
      picks: team.knockoutPicks?.dieciseisavos ?? [],
      actual: results.knockout.dieciseisavos,
      pts: SCORING.eliminatorias.dieciseisavos,
    },
    {
      picks: team.knockoutPicks?.octavos ?? [],
      actual: results.knockout.octavos,
      pts: SCORING.eliminatorias.octavos,
    },
    {
      picks: team.knockoutPicks?.cuartos ?? [],
      actual: results.knockout.cuartos,
      pts: SCORING.eliminatorias.cuartos,
    },
    {
      picks: team.knockoutPicks?.semis ?? [],
      actual: results.knockout.semis,
      pts: SCORING.eliminatorias.semis,
    },
    {
      picks: team.knockoutPicks?.finalTeams ?? [],
      actual: results.knockout.finalTeams,
      pts: SCORING.eliminatorias.final,
    },
  ];

  for (const round of koRounds) {
    const actualSet = new Set(round.actual);
    for (const pick of round.picks) {
      if (actualSet.has(pick)) {
        finalPhasePoints += round.pts;
      }
    }
  }

  // Posiciones finales
  if (results.knockout.campeon && team.championPick === results.knockout.campeon) {
    finalPhasePoints += SCORING.posicionesFinales.campeon;
  }
  if (results.knockout.subcampeon && team.subcampeonPick === results.knockout.subcampeon) {
    finalPhasePoints += SCORING.posicionesFinales.subcampeon;
  }
  if (results.knockout.tercero && team.terceroPick === results.knockout.tercero) {
    finalPhasePoints += SCORING.posicionesFinales.tercero;
  }

  // ── ESPECIALES ──────────────────────────────────────
  const s = results.specials;
  const tp = team.specials;

  if (s.mejorJugador && tp.mejorJugador === s.mejorJugador)
    specialPoints += SCORING.especiales.mejorJugador;
  if (s.mejorJoven && tp.mejorJoven === s.mejorJoven)
    specialPoints += SCORING.especiales.mejorJoven;
  if (s.maxGoleador && tp.maxGoleador === s.maxGoleador)
    specialPoints += SCORING.especiales.maxGoleador;
  if (s.maxAsistente && tp.maxAsistente === s.maxAsistente)
    specialPoints += SCORING.especiales.maxAsistente;
  if (s.mejorPortero && tp.mejorPortero === s.mejorPortero)
    specialPoints += SCORING.especiales.mejorPortero;
  if (s.maxGoleadorEsp && tp.maxGoleadorEsp === s.maxGoleadorEsp)
    specialPoints += SCORING.especiales.maxGoleadorEsp;
  if (s.primerGolEsp && tp.primerGolEsp === s.primerGolEsp)
    specialPoints += SCORING.especiales.primerGolEsp;
  if (s.revelacion && tp.revelacion === s.revelacion)
    specialPoints += SCORING.especiales.revelacion;
  if (s.decepcion && tp.decepcion === s.decepcion)
    specialPoints += SCORING.especiales.decepcion;
  if (s.minutoPrimerGol !== null && tp.minutoPrimerGol === s.minutoPrimerGol)
    specialPoints += SCORING.especiales.minutoPrimerGol;

  return {
    groupPoints,
    finalPhasePoints,
    specialPoints,
    totalPoints: groupPoints + finalPhasePoints + specialPoints,
  };
}

export function recalculateAllParticipants(
  teams: Team[],
  results: AdminResults
): Team[] {
  const updated = teams.map((t) => {
    const pts = calculateTeamPoints(t, results);
    return {
      ...t,
      groupPoints: pts.groupPoints,
      finalPhasePoints: pts.finalPhasePoints,
      specialPoints: pts.specialPoints,
      totalPoints: pts.totalPoints,
    };
  });

  updated.sort((a, b) => b.totalPoints - a.totalPoints);
  let rank = 1;
  for (let i = 0; i < updated.length; i++) {
    if (i > 0 && updated[i].totalPoints < updated[i - 1].totalPoints) rank = i + 1;
    updated[i].currentRank = rank;
  }
  return updated;
}
