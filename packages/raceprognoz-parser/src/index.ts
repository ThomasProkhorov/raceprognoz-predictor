import { config } from "./config.js";
import { fetchHtml } from "./http.js";
import { parseEvents } from "./parse-events.js";
import { parsePredictions } from "./parse-predictions.js";
import { parseStageStandings } from "./parse-stage-standings.js";
import { parseSummary } from "./parse-summary.js";
import { parseYears } from "./parse-years.js";
import type { UserPrediction, EventUrl, StageStanding, ChampionshipStanding } from "./types.js";

export async function getPredictions(url: string): Promise<UserPrediction[]> {

    const html = await fetchHtml(url);

    if (!html) {
        throw new Error("Empty HTML response");
    }   

    return parsePredictions(html);
}

export async function getYears(): Promise<number[]> {

    const html = await fetchHtml(config.baseUrl + config.resultsPath + config.year + config.file);

    if (!html) {
        throw new Error("Empty HTML response");
    }   

    return parseYears(html);
}

export async function getEvents(year: number): Promise<EventUrl[]> {

    const url = `${config.baseUrl}${config.predictionsPath}${year}${config.file}`;

    const { html, url: redirectUrl } = await fetchHtml(url, 'includeUrl');

    if (!html) {
        throw new Error("Empty HTML response");
    }

    const events = parseEvents(html, year);

    return events.map(e => e.url === "" ? { ...e, url: redirectUrl.slice((config.baseUrl + config.predictionsPath).length) } : e);
}

export async function getStageStandings(url: string): Promise<StageStanding[]> {

    const html = await fetchHtml(url + config.suffix);

    if (!html) {
        throw new Error("Empty HTML response");
    }   
    return parseStageStandings(html);
}

export async function getChampionshipStandings(year: number): Promise<ChampionshipStanding[]> {

    const html = await fetchHtml(`${config.baseUrl}${config.resultsPath}${year}${config.file}${config.suffix}`);

    if (!html) {
        throw new Error("Empty HTML response");
    }   
    return parseSummary(html);
}

export type { UserPrediction, YearUrl, EventUrl, StageStanding, ChampionshipStanding } from "./types.js";