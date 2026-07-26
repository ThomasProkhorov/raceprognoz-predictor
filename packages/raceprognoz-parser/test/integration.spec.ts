import { describe, it, expect } from "vitest";
import { getPredictions, getYears, getEvents, getStageStandings, getChampionshipStandings } from "../src/index.js";
import { CONTRACT, PRE_URL, RES_URL } from "./contracts.js";

describe("predictions tests", () => {    

    it("should fetch proper predictions content", async () => {
        
        const result = await getPredictions(PRE_URL);

        expect(result.length).toBe(CONTRACT.participants);
        expect(result.every(u => typeof u.userId === "number")).toBe(true);
        expect(result.every(u => typeof u.userName === "string")).toBe(true);
        expect(result.every(u => u.posted instanceof Date)).toBe(true);
        expect(result.every(u => u.prediction.size === CONTRACT.predictionsPerUser)).toBe(true);
    });
});

describe("years tests", () => {    

    it("should fetch proper years content", async () => {
        const result = await getYears();

        expect(result.length).toBeGreaterThan(0);

        result.forEach(year => {
            expect(typeof year).toBe("number");
            expect(year).toBeGreaterThanOrEqual(CONTRACT.minYear);
            expect(year).toBeLessThanOrEqual(new Date().getFullYear());
        });
    });
});

describe("events tests", () => {

    it("should fetch all events for the year", async () => {
        const result = await getEvents(CONTRACT.minYear);

        expect(result.length).toBe(CONTRACT.eventsCount);

        result.forEach(event => {
            expect(typeof event.name).toBe("string");
            expect(event.name.length).toBeGreaterThan(0);
            expect(typeof event.url).toBe("string");
            expect(event.url).toContain(`${CONTRACT.minYear}/`);
        });
    });
});

describe("stage standings tests", () => {

    it("should fetch stage standings correctly", async () => {
        const result = await getStageStandings(RES_URL);

        expect(result.length).toBe(CONTRACT.participants);

        result.forEach(row => {
            expect(typeof row.userName).toBe("string");
            expect(typeof row.teamName).toBe("string");
            expect(typeof row.userId).toBe("number");
            expect(typeof row.place).toBe("number");
            expect(typeof row.points).toBe("number");
            expect(row.scoreBreakdown.length).toBe(CONTRACT.predictionsPerUser);
        });
    });
});

describe("championship standings tests", () => {

    it("should fetch championship standings correctly", async () => {
        const result = await getChampionshipStandings(2026);
        
        expect(result.length).toBeGreaterThan(0);

        result.forEach(row => {
            expect(typeof row.userName).toBe("string");
            expect(typeof row.teamName).toBe("string");
            expect(typeof row.userId).toBe("number");
            expect(typeof row.place).toBe("number");
            expect(typeof row.totalPoints).toBe("number");
            expect(row.stages.length).toBeGreaterThan(0);
        });
    });
});
