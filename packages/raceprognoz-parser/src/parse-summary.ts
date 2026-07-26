import * as cheerio from "cheerio";
import type { ChampionshipStanding, StagePoints } from "./types.js";
import { parseUser } from "./parse-user.js";

export function parseSummary(html: string): ChampionshipStanding[] {
    const $ = cheerio.load(html);

    const table = $(".content table tbody").first();

    if (table.length === 0) {
        throw new Error("Summary table not found.");
    }

    return table
        .children("tr")
        .slice(2, -1)
        .map((_, row) => {
            
            const cells = $(row).children("td");

            if (cells.length < 4) {
                throw new Error("Invalid summary row.");
            }

            const place = Number(cells.eq(0).text().trim());

            const { userName, userId, teamName } = parseUser(cells.eq(2).text());

            const stageCells = cells.slice(3, -1);

            const stages: StagePoints[] = [];

            stageCells.each((_, cell) => {

                const td = $(cell);

                const pointText = td.find("#pnt").text();
                const placeText = td.find("#pl").text();
            
                stages.push({
                    points: pointText ? Number(pointText) : null,
                    place: placeText ? Number(placeText) : null
                });
            });

            const totalText = cells.last().contents().first().text().trim();

            return {
                place,
                userId,
                userName,
                teamName,
                stages,
                totalPoints: Number(totalText)
            };

        })
        .get();
}