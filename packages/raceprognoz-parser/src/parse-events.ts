import * as cheerio from "cheerio";
import { config } from "./config.js";
import type { EventUrl } from "./types.js";

export function parseEvents(html: string, year?: number): EventUrl[] {
    
    const $ = cheerio.load(html);

    return $(".stage-panel .stage-btn")
        .map((_, element) => {
            const event = $(element);

            const href = event.attr("href");
            const id = href
                ? `${year}/${href}`
                : "";

            return {
                url: id,
                name: `${event.find(".s-line1").text()} ${event.find(".s-line2").text()}`
            };
        })
        .get();
}