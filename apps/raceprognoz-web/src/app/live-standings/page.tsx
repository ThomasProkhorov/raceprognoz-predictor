import { getYears, getChampionshipStandings, getPredictions } from "raceprognoz-parser";
import { getEventDetails, getResults, getSeason, getSeasonDetails } from "@/lib/api/ocblacktop";
import { scorePredictions, type LiveResult } from "@/lib/live-scoring";
import { parseEventResults } from "@/lib/parsers/ocb-event-parser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function LiveStandingsPage() {
  let standings: Awaited<ReturnType<typeof getChampionshipStandings>> = [];
  let predictions: Awaited<ReturnType<typeof getPredictions>> = [];
  let error: string | null = null;
  let year = 2026;
  let eventName = "—";
  const livePoints = new Map<number, number>();

  try {
    const years = await getYears();
    year = Math.max(...years);
    standings = await getChampionshipStandings(year);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load standings";
  }
  
  const season = await getSeason(new Date().getFullYear());  
  const seasonDetails = await getSeasonDetails(season.id);
  let eventId = seasonDetails.schedule.find((event) => event.status === "ongoing")?.id ?? '';
  if (eventId==='') {
    eventId = seasonDetails.schedule.filter((event) => event.status === "completed")?.slice(-1)[0]?.id ?? '';
  }
  const event = await getEventDetails(eventId);  
  if (event) eventName = event.name;

  const originalPlaces = new Map<number, number>();
  standings
    .slice()
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .forEach((s, i) => originalPlaces.set(s.userId, i + 1));

  if (event) {
    const raceSession = event.schedule.find((s) => s.type === "race");
    const qualiSession = event.schedule.find((s) => s.type === "qualifying");

    const ongoingType = raceSession?.status === "ongoing"
      ? "race" as const
      : qualiSession?.status === "ongoing"
        ? "qualifying" as const
        : null;

    let liveResults: LiveResult[] = [];

    if (ongoingType) {
      try {
        const parsed = await parseEventResults(event.id);
        const session = parsed.sessions.find((s) => s.type === ongoingType);
        if (session) {
          liveResults = session.results.map((r) => ({
            position: r.position,
            driverCode: r.driver.code,
            driverName: r.driver.fullName,
            team: null,
            time: null,
            points: null
          }));
        }
      } catch {}
    } else {
      const target =
        raceSession?.status === "completed"
          ? { id: raceSession.id, filterGrid: true }
          : qualiSession?.status === "completed"
            ? { id: qualiSession.id, filterGrid: false }
            : null;

      if (target) {
        try {
          const seen = new Set<string>();
          const results = (await getResults(event.id, target.id))
            .filter((r) => {
              if (target.filterGrid && r.gridPosition == null) return false;
              const key = `${r.position}_${r.driver.id}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            })
            .map((r) => ({
              position: r.position,
              driverCode: r.driver.code,
              driverName: `${r.driver.firstName} ${r.driver.lastName}`,
              team: null,
              time: null,
              points: null
            }));
          liveResults = results;
        } catch { console.log("--------------------------"); }
      }
    }

    if (liveResults.length > 0) {
      try {
        predictions = await getPredictions("https://raceprognoz.ru/formula1/usersprognozs/2026/index.php");

        for (const p of predictions) {
          const { total } = scorePredictions(p.prediction, liveResults);
          livePoints.set(p.userId, total);
        }

        standings = standings
          .map((s) => ({
            ...s,
            totalPoints: s.totalPoints + (livePoints.get(s.userId) ?? 0),
          }))
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((s, i) => ({ ...s, place: i + 1 }));
      } catch { console.log("--------------------------"); }
    }
  }

  const stageCount = standings.length > 0 ? standings[0].stages.length : 0;

  let liveIndex = -1;
  if (standings.length > 0) {
    let lastScored = -1;
    for (let i = 0; i < stageCount; i++) {
      const anyCompleted = standings.some((s) => s.stages[i].points != null);
      if (anyCompleted) lastScored = i;
      else break;
    }
    if (lastScored >= 0) liveIndex = lastScored + 1;
  }

  const totalColumns = liveIndex >= 0 ? liveIndex + 1 : stageCount;
  const colLabels = Array.from({ length: totalColumns }, (_, i) => `${i + 1}`);

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold uppercase tracking-[0.02em]">
          Live Standings
        </h1>
        <p className="text-sm text-[#e10600]">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-[0.02em]">
          Live Standings
        </h1>
        <p className="mt-1 text-sm text-[#8d8d8d]">
          {year} Season — {eventName}
        </p>
        <p className="text-xs text-[#8d8d8d]">
          {standings.length} predictors
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2a2a2a]">
              <TableHead className="w-10 text-center text-xs uppercase text-[#8d8d8d]">
                #
              </TableHead>
              <TableHead className="w-12 text-center text-xs uppercase text-[#8d8d8d]">
                ↑↓
              </TableHead>
              <TableHead className="min-w-[180px] text-xs uppercase text-[#8d8d8d]">
                Predictor
              </TableHead>
              {colLabels.map((label, i) => (
                <TableHead
                  key={i}
                  className="w-12 text-center text-xs uppercase text-[#8d8d8d]"
                >
                  {label}
                </TableHead>
              ))}
              <TableHead className="w-20 pl-0.5 pr-0 text-center text-xs uppercase text-[#8d8d8d]">
                Total
              </TableHead>
              <TableHead className="w-20 pl-0 pr-0.5 text-center text-xs uppercase text-[#8d8d8d]">
                DIFF
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.length === 0 && (
              <TableRow className="border-[#2a2a2a]">
                <TableCell
                  colSpan={5 + totalColumns}
                  className="py-12 text-center text-sm text-[#8d8d8d]"
                >
                  No standings available
                </TableCell>
              </TableRow>
            )}
            {standings.map((s) => {
              const live = livePoints.get(s.userId);
              return (
                <TableRow key={s.userId} className="border-[#2a2a2a]">
                  <TableCell className="text-center text-xs font-bold text-[#8d8d8d]">
                    {s.place}
                  </TableCell>
                  <TableCell className="text-center text-xs tabular-nums">
                    {(() => {
                      const orig = originalPlaces.get(s.userId);
                      if (orig == null) return null;
                      const diff = orig - s.place;
                      if (diff > 0) {
                        return (
                          <span className="inline-flex items-center gap-px text-[#00e000]">
                            <span className="leading-none">↑</span>{diff}
                          </span>
                        );
                      }
                      if (diff < 0) {
                        return (
                          <span className="inline-flex items-center gap-px text-[#e10600]">
                            <span className="leading-none">↓</span>{-diff}
                          </span>
                        );
                      }
                      return (
                        <span className="text-[#8d8d8d]">=</span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {s.userName}
                    <span className="ml-1 text-xs text-[#8d8d8d]">
                      #{s.userId}
                    </span>
                  </TableCell>
                  {colLabels.map((_, col) => {
                    const st = s.stages[col];
                    if (st.points != null) {
                      return (
                        <TableCell
                          key={col}
                          className="text-center text-xs tabular-nums text-[#cfcfcf]"
                        >
                          {st.points}
                        </TableCell>
                      );
                    }
                    if (col === liveIndex && live != null) {
                      return (
                        <TableCell
                          key={col}
                          className="text-center text-xs tabular-nums text-[#e10600]"
                        >
                          {live}
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell
                        key={col}
                        className="text-center text-xs tabular-nums text-[#8d8d8d]"
                      >
                        —
                      </TableCell>
                    );
                  })}
                  <TableCell className="pl-0.5 pr-0 text-center text-sm font-bold text-[#fff]">
                    {s.totalPoints}
                  </TableCell>
                  <TableCell className="pl-0 pr-0.5 text-center text-xs tabular-nums text-[#8d8d8d]">
                    {(() => {
                      const idx = standings.findIndex((x) => x.userId === s.userId);
                      const leader = standings[0];
                      const toLeader = leader ? leader.totalPoints - s.totalPoints : 0;
                      const prev = idx > 0 ? standings[idx - 1] : null;
                      const toPrev = prev ? prev.totalPoints - s.totalPoints : 0;
                      if (idx === 0) return "=";
                      if (idx === 1) return `${toLeader}`;
                      return `${toLeader} / ${toPrev === 0 ? "=" : toPrev}`;
                    })()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
