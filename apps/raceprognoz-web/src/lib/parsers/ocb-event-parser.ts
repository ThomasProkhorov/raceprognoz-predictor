import * as cheerio from "cheerio";

const OCB_BASE_URL = "https://ocblacktop.com/events";

export interface ParsedDriver {
  fullName: string;
  firstName: string;
  lastName: string;
  code: string;
}

export interface ParsedResultRow {
  position: string;
  driver: ParsedDriver;
  teamName: string;
  teamColor: string | null;
  time: string | null;
  points: number;
  status: "OK" | "DNF";
}

export interface ParsedSession {
  name: string;
  type: string;
  results: ParsedResultRow[];
}

export interface ParsedEventResults {
  eventId: string;
  eventName: string;
  trackName: string;
  country: string;
  dateStart: string;
  dateEnd: string;
  sport: string;
  sessions: ParsedSession[];
}

interface JsonLdSportsEvent {
  name?: string;
  startDate?: string;
  endDate?: string;
  sport?: string;
  location?: { name?: string; address?: { addressCountry?: string } };
  subEvent?: { name?: string; startDate?: string; endDate?: string }[];
}

function extractSportsEventJsonLd(html: string): JsonLdSportsEvent | null {
  const $ = cheerio.load(html);
  for (const el of $('script[type="application/ld+json"]')) {
    try {
      const raw = $(el).html();
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed["@type"] === "SportsEvent") return parsed;
    } catch {
      // skip invalid JSON
    }
  }
  return null;
}

function parseRscPayload(html: string): unknown {
  const $ = cheerio.load(html);

  for (const script of $("script")) {
    const content = $(script).html() || "";
    if (!content.includes("self.__next_f.push")) continue;

    const re = /self\.__next_f\.push\(\[(\d+),("(?:[^"\\]|\\.)*")/g;
    let match: RegExpExecArray | null;

    while ((match = re.exec(content)) !== null) {
      try {
        const rawJson = JSON.parse(match[2]) as string;
        const colonIdx = rawJson.indexOf(":");
        if (colonIdx === -1) continue;
        const payload = rawJson.slice(colonIdx + 1);

        if (!payload.includes("sessions") || !payload.includes("results")) continue;

        const parsed = JSON.parse(payload);
        if (!Array.isArray(parsed)) continue;

        for (const item of parsed) {
          if (Array.isArray(item) && item[2] === null && typeof item[3] === "object" && item[3] !== null) {
            const props = item[3] as Record<string, unknown>;
            if (props.event && typeof props.event === "object") {
              return props.event;
            }
          }
        }
      } catch {
        continue;
      }
    }
  }
  return null;
}

function mapSessionType(rawType: string): string {
  switch (rawType) {
    case "practice": return "practice";
    case "qualifying": return "qualifying";
    case "race": return "race";
    default: return rawType;
  }
}

function mapResultRow(raw: Record<string, unknown>): ParsedResultRow {
  const driverRaw = raw.driver as Record<string, unknown> | undefined;
  const teamRaw = raw.team as Record<string, unknown> | undefined;

  const position = String(raw.position ?? "");
  const lapTime = raw.lapTime ? String(raw.lapTime) : null;
  const displayTime = raw.displayTime ? String(raw.displayTime) : null;
  const pointsRaw = raw.points;
  const points = typeof pointsRaw === "string" ? parseFloat(pointsRaw) : (typeof pointsRaw === "number" ? pointsRaw : 0);
  const statusRaw = String(raw.status ?? "OK");
  const status: "OK" | "DNF" = statusRaw === "DNF" ? "DNF" : "OK";

  const firstName = driverRaw?.firstName ? String(driverRaw.firstName) : "";
  const lastName = driverRaw?.lastName ? String(driverRaw.lastName) : "";
  const code = driverRaw?.code ? String(driverRaw.code) : "";
  const fullName = `${firstName} ${lastName}`.trim();

  const teamName = teamRaw?.name ? String(teamRaw.name) : "";
  const teamColor = teamRaw?.color ? String(teamRaw.color) : null;

  return {
    position,
    driver: { fullName, firstName, lastName, code },
    teamName,
    teamColor,
    time: displayTime || lapTime,
    points,
    status,
  };
}

export async function parseEventResults(eventId: string): Promise<ParsedEventResults> {
  const url = `${OCB_BASE_URL}/${eventId}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  const html = await res.text();

  const jsonLd = extractSportsEventJsonLd(html);
  const rscEvent = parseRscPayload(html) as Record<string, unknown> | null;

  const sessions: ParsedSession[] = [];

  if (rscEvent) {
    const rawSessions = rscEvent.sessions as Record<string, unknown>[];
    if (Array.isArray(rawSessions)) {
      for (const raw of rawSessions) {
        const rawResults = raw.results as Record<string, unknown>[] | undefined;
        if (!rawResults || !Array.isArray(rawResults) || rawResults.length === 0) continue;

        const results = rawResults.map(mapResultRow);
        sessions.push({
          name: String(raw.name ?? ""),
          type: mapSessionType(String(raw.type ?? "")),
          results,
        });
      }
    }
  }

  return {
    eventId,
    eventName: jsonLd?.name || (rscEvent?.name as string) || "",
    trackName: jsonLd?.location?.name || "",
    country: jsonLd?.location?.address?.addressCountry || "",
    dateStart: jsonLd?.startDate || "",
    dateEnd: jsonLd?.endDate || "",
    sport: jsonLd?.sport || "Formula 1",
    sessions,
  };
}
