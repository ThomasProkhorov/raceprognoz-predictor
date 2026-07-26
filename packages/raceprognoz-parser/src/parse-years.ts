import * as cheerio from "cheerio";

export function parseYears(html: string): number[] {
  const $ = cheerio.load(html);

  return $(".year-panel .year-btn")
    .map((_, el) => {
      const element = $(el);

      return Number(element.find(".y-num").text());
    })
    .get();
}