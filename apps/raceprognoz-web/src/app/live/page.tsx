import { getPredictions } from "raceprognoz-parser";
import { getEventDetails, getResults, getSeason, getSeasonDetails } from "@/lib/api/ocblacktop";
import { scorePredictions, type LiveResult, type ScoredEntry } from "@/lib/live-scoring";
import { parseEventResults } from "@/lib/parsers/ocb-event-parser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SESSION_LABELS: Record<string, string> = {
  race: "Race",
  qualifying: "Qualifying",
};

function formatSessionType(type: string): string {
  return SESSION_LABELS[type] ?? type;
}

export const dynamic = "force-dynamic";

export default async function LivePage() {

  const season = await getSeason(new Date().getFullYear());  
  const seasonDetails = await getSeasonDetails(season.id);
  const eventId = seasonDetails.schedule.find((event) => event.status === "ongoing")?.id ?? '';
  const event = await getEventDetails(eventId);  
  let results: LiveResult[] = [];
  let sessionType: string | null = null;
  let resultsError: string | null = null;
  let predictions: Awaited<ReturnType<typeof getPredictions>> = [];

  if (event) {
    const raceSession = event.schedule.find((s) => s.type === "race");
    const qualiSession = event.schedule.find((s) => s.type === "qualifying");
    const completedSessions = event.schedule.filter((s) => s.status === "completed");
    const lastCompleted = completedSessions[completedSessions.length - 1] ?? null;

    const ongoingType = raceSession?.status === "ongoing"
      ? ("race" as const)
      : qualiSession?.status === "ongoing"
        ? ("qualifying" as const)
        : null;

    if (ongoingType) {
      try {
        const parsed = await parseEventResults(eventId);
        const session = parsed.sessions.find((s) => s.type === ongoingType);
        if (session) {
          results = session.results.map((r) => ({
            position: r.position,
            driverCode: r.driver.code,
            driverName: r.driver.fullName,
          }));
          sessionType = session.type;
        }
      } catch (e) {
        resultsError = e instanceof Error ? e.message : "Failed to fetch results";
      }
    } else if (lastCompleted) {
      try {
        const seen = new Set<string>();
        const raw = await getResults(eventId, lastCompleted.id);
        results = raw
          .filter((r) => {
            if (lastCompleted.type == 'race' && r.gridPosition == null) return false;
            const key = `${r.position}_${r.driver.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((r) => ({
            position: r.position,
            driverCode: r.driver.code,
            driverName: `${r.driver.firstName} ${r.driver.lastName}`,
          }));
        sessionType = lastCompleted.type;
      } catch (e) {
        resultsError = e instanceof Error ? e.message : "Failed to fetch results";
      }
    }

    if (!results && !resultsError) {
      resultsError = "No results yet";
    }
  }

  try {
    predictions = await getPredictions("https://raceprognoz.ru/formula1/usersprognozs/2026/index.php");
  } catch {}

  const scored: ScoredEntry[] = results
    ? predictions
        .map((p) => {
          const { total, details } = scorePredictions(p.prediction, results);
          return { ...p, total, details };
        })
        .sort((a, b) => b.total - a.total)
    : [];

  const positions = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-[0.02em]">Live</h1>
        {event && <p className="mt-1 text-sm text-[#8d8d8d]">{event.name}</p>}
        {event && (
          <div className="mt-2 flex gap-3 text-xs">
            {["qualifying", "race"].map((type) => {
              const s = event.schedule.find((s) => s.type === type);
              if (!s) return null;
              return (
                <span key={type} className="flex items-center gap-1.5">
                  <span className="capitalize">{type}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] uppercase leading-none ${
                      s.status === "completed"
                        ? "bg-[#e10600]/20 text-[#e10600]"
                        : s.status === "ongoing"
                          ? "bg-[#4ade80]/20 text-[#4ade80]"
                          : "bg-[#8d8d8d]/20 text-[#8d8d8d]"
                    }`}
                  >
                    {s.status}
                  </span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {resultsError && (
        <div className="rounded-xl border border-[#2a2a2a] p-4">
          <p className="text-sm text-[#8d8d8d]">{resultsError}</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#2a2a2a]">
              <TableHead className="w-10 text-center text-xs uppercase text-[#8d8d8d]">
                #
              </TableHead>
              <TableHead className="min-w-[180px] text-xs uppercase text-[#8d8d8d]">
                Predictor
              </TableHead>
              {positions.map((p) => (
                <TableHead
                  key={p}
                  className="w-16 text-center text-xs uppercase text-[#8d8d8d]"
                >
                  P{p}
                </TableHead>
              ))}
              <TableHead className="w-16 text-center text-xs uppercase text-[#8d8d8d]">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scored.length === 0 && predictions.length === 0 && (
              <TableRow className="border-[#2a2a2a]">
                <TableCell
                  colSpan={11}
                  className="py-12 text-center text-sm text-[#8d8d8d]"
                >
                  No predictions available
                </TableCell>
              </TableRow>
            )}
            {scored.length === 0 && predictions.length > 0 && !results && (
              <TableRow className="border-[#2a2a2a]">
                <TableCell
                  colSpan={11}
                  className="py-12 text-center text-sm text-[#8d8d8d]"
                >
                  Waiting for session results
                </TableCell>
              </TableRow>
            )}
            {scored.map((p, i) => (
              <TableRow key={p.userId} className="border-[#2a2a2a]">
                <TableCell className="text-center text-xs text-[#e10600]">
                  {i + 1}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {p.userName}
                  <span className="ml-1 text-xs text-[#8d8d8d]">
                    #{p.userId}
                  </span>
                </TableCell>
                {positions.map((pos) => {
                  const driverName = p.prediction.get(pos);
                  const pts = p.details.get(pos) ?? 0;
                  const code = results?.find((r) => r.driverName === driverName)?.driverCode;

                  const t = Math.min(pts / 25, 1);
                  const rr = Math.round(141 + (225 - 141) * t);
                  const g = Math.round(141 + (6 - 141) * t);
                  const b = Math.round(141 + (0 - 141) * t);
                  const driverColor = results ? `rgb(${rr},${g},${b})` : "#8d8d8d";

                  return (
                    <TableCell
                      key={pos}
                      className="text-center tabular-nums"
                    >
                      {results && (
                        <span className="mr-1.5 text-sm font-bold text-[#f0f0f0]">{pts}</span>
                      )}
                      <span className="text-[10px]" style={{ color: driverColor }}>
                        {code ?? driverName ?? "—"}
                      </span>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center text-sm font-semibold text-[#fff]">
                  {results ? p.total : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {results && sessionType && (
        <div className="rounded-xl border border-[#2a2a2a] p-4">
          <p className="mb-3 text-xs uppercase tracking-wider text-[#8d8d8d]">
            Results from {formatSessionType(sessionType)}
          </p>
          <div className="flex flex-col gap-1.5">
            {results.map((r) => (
              <span key={r.driverCode} className="grid grid-cols-[2rem_1fr] items-baseline gap-3">
                <span className="text-xs tabular-nums text-[#e10600] text-right">
                  {r.position}
                </span>
                <span className="text-sm font-semibold text-[#cfcfcf]">
                  {r.driverName}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
