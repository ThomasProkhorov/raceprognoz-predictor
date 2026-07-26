import * as cheerio from "cheerio";
import { assertDefined } from "./utils.js";
import { parseDateTime } from "./date.js";
import { parseUserInfo } from "./user-info.js";
import type { UserPrediction } from "./types.js";

export function parsePredictions(html: string): UserPrediction[] {

    const $ = cheerio.load(html);

    const results = $("#result");

    const tables = results.find("table");

    return tables.map((_, table) => {

        const rows = $(table).find("tr");

        const userRow = assertDefined(rows.eq(0).find("td").first(), "User info row not found");

        const rawHtml = userRow.html();

        if (!rawHtml) {
            throw new Error("User info row is empty");
        }

        const [topRaw, bottomRaw] = rawHtml.split(/<br\s*\/?>/i);

        const userText = $(topRaw).text().trim();
        const dateText = $(bottomRaw).text().trim();

        const { userName, userId } = parseUserInfo(userText);

        const posted = parseDateTime(dateText);

        const prediction = new Map<number, string>();

        rows.slice(1).each((_, row) => {

            const cells = $(row).find("td");

            const position = Number($(cells[0]).text().trim());

            const driver = $(cells[1]).text();

            if (position < 1 || position > 8) {
                throw new Error("Invalid position");
            }

            prediction.set(position, driver);
        });

        return {
            userName,
            userId,
            posted,
            prediction
        };

    }).get();
}