import { getPredictions } from "raceprognoz-parser";
import { getEventDetails, getSeason, getSeasonDetails } from "@/lib/api/ocblacktop";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function PredictionsPage() {
  let predictions: Awaited<ReturnType<typeof getPredictions>> = [];
  let eventName = "—";
  let error: string | null = null;

  try {
    const season = await getSeason(new Date().getFullYear());  
    const seasonDetails = await getSeasonDetails(season.id);
    const eventId = seasonDetails.schedule.find((event) => event.status === "ongoing")?.id ?? '';
    const event = await getEventDetails(eventId);  
    if (event) {
      eventName = event.name;
      //console.log(eventName)
    }
  } catch {}

  try {
    const url = "https://raceprognoz.ru/formula1/usersprognozs/2026/index.php";
    predictions = await getPredictions(url);
    //console.dir(url)
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load predictions";
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold uppercase tracking-[0.02em]">
          Predictions
        </h1>
        <p className="text-sm text-[#e10600]">{error}</p>
      </div>
    );
  }

  const positions = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-[0.02em]">
          Predictions
        </h1>
        <p className="mt-1 text-sm text-[#8d8d8d]">{eventName}</p>
        <p className="text-xs text-[#8d8d8d]">
          {predictions.length} predictors
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
              {positions.map((p) => (
                <TableHead
                  key={p}
                  className="w-16 text-center text-xs uppercase text-[#8d8d8d]"
                >
                  P{p}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {predictions.length === 0 && (
              <TableRow className="border-[#2a2a2a]">
                <TableCell
                  colSpan={10}
                  className="py-12 text-center text-sm text-[#8d8d8d]"
                >
                  No predictions available
                </TableCell>
              </TableRow>
            )}
            {predictions.map((p, i) => (
              <TableRow key={p.userId} className="border-[#2a2a2a]">
                <TableCell className="text-center text-xs text-[#8d8d8d]">
                  {i + 1}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {p.userName}
                  <span className="ml-1 text-xs text-[#8d8d8d]">
                    #{p.userId}
                  </span>
                </TableCell>
                {positions.map((pos) => (
                  <TableCell
                    key={pos}
                    className="text-center text-sm text-[#cfcfcf]"
                  >
                    {p.prediction.get(pos) ?? "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
