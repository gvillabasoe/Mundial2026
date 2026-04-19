import { NextResponse } from "next/server";
import { normalizeName } from "@/lib/data";
import { normalizeCity } from "@/lib/config/regions";
import type { MatchStage } from "@/lib/worldcup/schedule";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE = "https://v3.football.api-sports.io";
const DEFAULT_API_KEY = "4efad1513ecd4f716ad4f91fbff82490";
const WORLD_CUP_LEAGUE_ID = 1;
const TEST_FIXTURE_LOOKUP = {
  date: "2026-04-20",
  league: 39,
  season: 2025,
  homeTeam: "Crystal Palace",
  awayTeam: "West Ham United",
} as const;
const TEST_FIXTURE_STAGE: MatchStage = "final";
const TEST_FIXTURE_LABEL = "Premier League";
const TEST_FIXTURE_HIDE_AFTER_MS = 2 * 60 * 60 * 1000;
const POLLING_LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "BT", "P"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

interface ApiSportsPayload {
  response?: any[];
  errors?: Record<string, string>;
}

export interface ApiFixtureItem {
  apiId: number | null;
  stage: MatchStage;
  roundLabel: string;
  competitionLabel?: string | null;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
  minute: number | null;
  statusShort: string;
  city: string | null;
  score: { home: number | null; away: number | null };
  supplemental?: boolean;
}

let cachedTestFixtureId: number | null = null;
let cachedTestFixtureIdAt = 0;

function mapRoundToStage(roundLabel: string): MatchStage {
  const round = roundLabel.toLowerCase();
  if (round.includes("semi")) return "semi-final";
  if (round.includes("third") || round.includes("3rd")) return "third-place";
  if (round.includes("quarter") || round.includes("1/4")) return "quarter-final";
  if (round.includes("group")) return "group";
  if (round.includes("1/16") || round.includes("round of 32") || round.includes("sixteenth")) return "round-of-32";
  if (round.includes("1/8") || round.includes("round of 16") || round.includes("eighth")) return "round-of-16";
  if (round.includes("final")) return "final";
  return "group";
}

function sortFixtures(fixtures: ApiFixtureItem[]) {
  return [...fixtures].sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());
}

function normalizeLookupName(name: string | null | undefined) {
  return (name || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeVenueCity(raw: string | null | undefined): string | null {
  const normalized = normalizeCity(raw);
  if (normalized) return normalized;
  const trimmed = raw?.trim();
  return trimmed || null;
}

function mapFixtureItem(
  item: any,
  options?: {
    stage?: MatchStage;
    roundLabel?: string;
    competitionLabel?: string | null;
    supplemental?: boolean;
    normalizeTeams?: boolean;
  }
): ApiFixtureItem {
  const fixture = item?.fixture;
  const league = item?.league;
  const teams = item?.teams;
  const goals = item?.goals;
  const status = fixture?.status;
  const roundLabel = options?.roundLabel || (league?.round as string) || "";
  const normalizeTeams = options?.normalizeTeams !== false;

  const rawHomeTeam = (teams?.home?.name as string) || "";
  const rawAwayTeam = (teams?.away?.name as string) || "";

  return {
    apiId: typeof fixture?.id === "number" ? fixture.id : null,
    stage: options?.stage || mapRoundToStage(roundLabel),
    roundLabel,
    competitionLabel: options?.competitionLabel ?? null,
    homeTeam: normalizeTeams ? normalizeName(rawHomeTeam) : rawHomeTeam,
    awayTeam: normalizeTeams ? normalizeName(rawAwayTeam) : rawAwayTeam,
    kickoff: (fixture?.date as string) || new Date().toISOString(),
    minute: typeof status?.elapsed === "number" ? status.elapsed : null,
    statusShort: ((status?.short as string) || "NS").toUpperCase(),
    city: normalizeVenueCity((fixture?.venue?.city as string) || null),
    score: {
      home: typeof goals?.home === "number" ? goals.home : null,
      away: typeof goals?.away === "number" ? goals.away : null,
    },
    supplemental: options?.supplemental || false,
  };
}

function shouldHideSupplementalFixture(fixture: ApiFixtureItem, now = Date.now()): boolean {
  if (!fixture.supplemental) return false;
  if (!FINISHED_STATUSES.has((fixture.statusShort || "NS").toUpperCase())) return false;

  const kickoffAt = new Date(fixture.kickoff).getTime();
  if (!Number.isFinite(kickoffAt)) return false;

  return now - kickoffAt >= TEST_FIXTURE_HIDE_AFTER_MS;
}

async function apiFetch(path: string, apiKey: string): Promise<ApiSportsPayload> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "x-apisports-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status} on ${path}`);
  }

  return response.json() as Promise<ApiSportsPayload>;
}

async function resolveTestFixtureId(apiKey: string): Promise<number | null> {
  const now = Date.now();
  if (cachedTestFixtureId && now - cachedTestFixtureIdAt < 6 * 60 * 60 * 1000) {
    return cachedTestFixtureId;
  }

  const payload = await apiFetch(
    `/fixtures?date=${TEST_FIXTURE_LOOKUP.date}&league=${TEST_FIXTURE_LOOKUP.league}&season=${TEST_FIXTURE_LOOKUP.season}`,
    apiKey
  );

  const homeNeedle = normalizeLookupName(TEST_FIXTURE_LOOKUP.homeTeam);

  const match = (payload.response || []).find((item) => {
    const home = normalizeLookupName(item?.teams?.home?.name);
    const away = normalizeLookupName(item?.teams?.away?.name);

    return home.includes(homeNeedle) && away.includes("west ham");
  });

  const fixtureId = typeof match?.fixture?.id === "number" ? match.fixture.id : null;
  if (fixtureId) {
    cachedTestFixtureId = fixtureId;
    cachedTestFixtureIdAt = now;
  }

  return fixtureId;
}

async function fetchTestFixture(apiKey: string): Promise<ApiFixtureItem | null> {
  const fixtureId = await resolveTestFixtureId(apiKey);
  if (!fixtureId) return null;

  const basePayload = await apiFetch(`/fixtures?id=${fixtureId}`, apiKey);
  let selectedItem = basePayload.response?.[0];
  if (!selectedItem) return null;

  const baseStatus = String(selectedItem?.fixture?.status?.short || "NS").toUpperCase();
  if (POLLING_LIVE_STATUSES.has(baseStatus)) {
    try {
      const livePayload = await apiFetch(`/fixtures?id=${fixtureId}&live=all`, apiKey);
      if (livePayload.response?.[0]) {
        selectedItem = livePayload.response[0];
      }
    } catch {
      // Fallback to the base fixture payload if the live endpoint is temporarily unavailable.
    }
  }

  const mapped = mapFixtureItem(selectedItem, {
    stage: TEST_FIXTURE_STAGE,
    roundLabel: TEST_FIXTURE_LABEL,
    competitionLabel: TEST_FIXTURE_LABEL,
    supplemental: true,
    normalizeTeams: false,
  });

  return shouldHideSupplementalFixture(mapped) ? null : mapped;
}

function buildCalendarPayload(connection: "calendar" | "error", error?: string, fixtures: ApiFixtureItem[] = []) {
  return {
    source: connection === "calendar" ? "calendar" : "api-football",
    connection,
    updatedAt: new Date().toISOString(),
    fixtures: sortFixtures(fixtures),
    ...(error ? { error } : {}),
  };
}

export async function GET() {
  const apiKey = process.env.API_SPORTS_KEY || DEFAULT_API_KEY;

  if (!apiKey) {
    return NextResponse.json(buildCalendarPayload("calendar"), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }

  const [worldCupResult, testFixtureResult] = await Promise.allSettled([
    apiFetch(`/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=2026`, apiKey),
    fetchTestFixture(apiKey),
  ]);

  const errors: string[] = [];

  const worldCupFixtures = worldCupResult.status === "fulfilled"
    ? (worldCupResult.value.response || []).map((item) => mapFixtureItem(item, { normalizeTeams: true }))
    : [];

  if (worldCupResult.status === "rejected") {
    errors.push(worldCupResult.reason instanceof Error ? worldCupResult.reason.message : "No se pudieron cargar los partidos del Mundial");
  }

  const testFixture = testFixtureResult.status === "fulfilled" ? testFixtureResult.value : null;
  if (testFixtureResult.status === "rejected") {
    errors.push(testFixtureResult.reason instanceof Error ? testFixtureResult.reason.message : "No se pudo cargar el partido de test");
  }

  const fixtures = sortFixtures([
    ...worldCupFixtures,
    ...(testFixture ? [testFixture] : []),
  ]);

  if (fixtures.length === 0 && errors.length > 0) {
    return NextResponse.json(buildCalendarPayload("error", errors.join(" | ")), {
      status: 502,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }

  return NextResponse.json(
    {
      source: "api-football",
      connection: "live",
      updatedAt: new Date().toISOString(),
      fixtures,
      ...(errors.length ? { error: errors.join(" | ") } : {}),
    },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}
