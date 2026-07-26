import { getYears, getChampionshipStandings } from "raceprognoz-parser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function StandingsPage() {
  let standings: Awaited<ReturnType<typeof getChampionshipStandings>> = [];
  let error: string | null = null;
  let year = 2026;

  try {
    const years = await getYears();
    year = Math.max(...years);
    standings = await getChampionshipStandings(year);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load standings";
  }

  const stageCount = standings.length > 0 ? standings[0].stages.length : 0;
  const stageLabels = Array.from({ length: stageCount }, (_, i) => `${i + 1}`);

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold uppercase tracking-[0.02em]">
          Standings
        </h1>
        <p className="text-sm text-[#e10600]">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-[0.02em]">
          Standings
        </h1>
        <p className="mt-1 text-sm text-[#8d8d8d]">
          {year} Season — F1 Predictor Standings
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
              <TableHead className="min-w-[180px] text-xs uppercase text-[#8d8d8d]">
                Predictor
              </TableHead>
              {stageLabels.map((label) => (
                <TableHead
                  key={label}
                  className="w-12 text-center text-xs uppercase text-[#8d8d8d]"
                >
                  {label}
                </TableHead>
              ))}
              <TableHead className="w-20 text-center text-xs uppercase text-[#8d8d8d]">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.length === 0 && (
              <TableRow className="border-[#2a2a2a]">
                <TableCell
                  colSpan={3 + stageCount}
                  className="py-12 text-center text-sm text-[#8d8d8d]"
                >
                  No standings available
                </TableCell>
              </TableRow>
            )}
            {standings.map((s) => (
              <TableRow key={s.userId} className="border-[#2a2a2a]">
                <TableCell className="text-center text-xs font-bold text-[#8d8d8d]">
                  {s.place}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {s.userName}
                  <span className="ml-1 text-xs text-[#8d8d8d]">
                    #{s.userId}
                  </span>
                </TableCell>
                {s.stages.map((st, i) => (
                  <TableCell
                    key={i}
                    className="text-center text-xs tabular-nums text-[#cfcfcf]"
                  >
                    {st.points ?? "—"}
                  </TableCell>
                ))}
                <TableCell className="text-center text-sm font-bold text-[#fff]">
                  {s.totalPoints}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
