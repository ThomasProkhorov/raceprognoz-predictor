import * as cheerio from "cheerio";
import type { StageStanding } from "./types.js";
import { parseUser } from "./parse-user.js";

export function parseStageStandings(html: string): StageStanding[] {
    const $ = cheerio.load(html);

    const table = $(".content table").first();

    if (table.length === 0) {
        throw new Error("Standings table not found.");
    }

    return table
        .find("tr")
        .slice(1, -1)
        .map((_, row) => {
            const cells = $(row).find("td");

            if (cells.length < 4) {
                throw new Error("Invalid standings row.");
            }

            const place = Number(cells.eq(0).text().trim());

            const { userName, userId, teamName } = parseUser(cells.eq(1).text());

            const points = Number(cells.eq(2).text().trim());

            const scoreBreakdown = cells
                .eq(3)
                .text()
                .split("/")
                .map(value => Number(value.trim()));

            return {
                place,
                userId: Number(userId),
                userName,
                teamName: String(teamName),
                points,
                scoreBreakdown,
            };
        })
        .get();
}