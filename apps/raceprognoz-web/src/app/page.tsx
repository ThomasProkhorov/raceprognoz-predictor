import Link from "next/link";
import { getEventDetails, getLastSession, getResults, getSeason, getSeasonDetails, Results } from "@/lib/api/ocblacktop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Home() {
  let currentGpName = "—";
  let dateRange = "";
  let hasApiKey = false;

  try {
    const season = await getSeason(new Date().getFullYear());
    //console.log(`Season ${new Date().getFullYear()}:\n${JSON.stringify(season ?? null, null, 2)}`); 

    const seasonDetails = await getSeasonDetails(season.id);
    const events = seasonDetails.schedule.filter((event) => event.status === "ongoing" || event.status === "completed");
    //console.log(`Last Session:\n${JSON.stringify(events ?? null, null, 2)}`);
    const eventId = events[events.length - 1].id;
    //console.log(`Current Event Id: ${eventId}`);
    const eventDetails = await getEventDetails(eventId);
    //console.log(`Current Event:\n${JSON.stringify(eventDetails ?? null, null, 2)}`);
    const lastSession = await getLastSession(eventId);
    //console.log(`Last Session:\n${JSON.stringify(lastSession ?? null, null, 2)}`);
    const results = await getResults(eventId, lastSession.id);
    //console.log(`Session Results:\n`);
    // results.forEach((r: Results) => {
    //   console.log(`${r.position} - ${r.driver.firstName} ${r.driver.lastName}, ${r.team.shortName}`);
    // });
    
    currentGpName = eventDetails.name;
    dateRange = `${eventDetails.dateStart} – ${eventDetails.dateEnd}`;
    hasApiKey = true;    
  } catch {
    hasApiKey = false;
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-xl border border-[#2a2a2a] bg-[#111] p-8">
        <Badge variant="secondary" className="mb-3 text-xs uppercase tracking-wider">
          {hasApiKey ? "Current Grand Prix" : "RacePrognoz"}
        </Badge>
        <h1 className="mb-2 text-4xl font-bold uppercase tracking-[0.02em]">
          {currentGpName}
        </h1>
        {dateRange && (
          <p className="text-sm text-[#8d8d8d]">{dateRange}</p>
        )}
        {!hasApiKey && (
          <p className="mt-4 text-sm text-[#8d8d8d]">
            Set <code className="rounded bg-[#202020] px-1.5 py-0.5 font-mono text-xs">OCBLACKTOP_API_KEY</code> in your environment to see live race data.
          </p>
        )}
      </section>

      <div className="grid gap-6 sm:grid-cols-3">
        <Link href="/predictions">
          <Card className="border-[#2a2a2a] bg-[#111] transition-all hover:border-[#e10600] hover:brightness-110">
            <CardHeader>
              <CardTitle className="uppercase tracking-[0.02em] text-[#e10600]">
                Predictions
              </CardTitle>
              <CardDescription>
                All predictor picks for the current stage
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-[#fff]">
              01
            </CardContent>
          </Card>
        </Link>
        <Link href="/standings">
          <Card className="border-[#2a2a2a] bg-[#111] transition-all hover:border-[#e10600] hover:brightness-110">
            <CardHeader>
              <CardTitle className="uppercase tracking-[0.02em] text-[#e10600]">
                Standings
              </CardTitle>
              <CardDescription>
                Predictor championship table
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-[#fff]">
              02
            </CardContent>
          </Card>
        </Link>
        <Link href="/live">
          <Card className="border-[#2a2a2a] bg-[#111] transition-all hover:border-[#e10600] hover:brightness-110">
            <CardHeader>
              <CardTitle className="uppercase tracking-[0.02em] text-[#e10600]">
                Live
              </CardTitle>
              <CardDescription>
                Actual race results vs predictions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-[#fff]">
              03
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
