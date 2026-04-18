export interface ProbabilityTeamConfig {
  teamKey: string;
  teamName: string;
  color: string;
  stroke?: string;
  isPrimary: boolean;
  aliases: string[];
}

export const FEATURED_TEAM_ORDER = [
  "España",
  "Argentina",
  "Francia",
  "Inglaterra",
  "Portugal",
  "Brasil",
  "Alemania",
] as const;

export const FEATURED_TEAMS: ProbabilityTeamConfig[] = [
  { teamKey: "espana", teamName: "España", color: "#C1121F", isPrimary: true, aliases: ["spain", "espana", "españa"] },
  { teamKey: "argentina", teamName: "Argentina", color: "#6EC6FF", isPrimary: false, aliases: ["argentina"] },
  { teamKey: "francia", teamName: "Francia", color: "#1D4ED8", isPrimary: false, aliases: ["france", "francia"] },
  { teamKey: "inglaterra", teamName: "Inglaterra", color: "#6B7280", isPrimary: false, aliases: ["england", "inglaterra"] },
  { teamKey: "portugal", teamName: "Portugal", color: "#16A34A", isPrimary: false, aliases: ["portugal"] },
  { teamKey: "brasil", teamName: "Brasil", color: "#EAB308", isPrimary: false, aliases: ["brazil", "brasil"] },
  { teamKey: "alemania", teamName: "Alemania", color: "#FFFFFF", stroke: "#111827", isPrimary: false, aliases: ["germany", "alemania", "deutschland"] },
];

export const FEATURED_TEAM_BY_NAME = Object.fromEntries(FEATURED_TEAMS.map((team) => [team.teamName, team])) as Record<string, ProbabilityTeamConfig>;

export const FEATURED_TEAM_BY_KEY = Object.fromEntries(FEATURED_TEAMS.map((team) => [team.teamKey, team])) as Record<string, ProbabilityTeamConfig>;
