import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parsePredictions } from "../src/parse-predictions.js";
import { parseStageStandings } from "../src/parse-stage-standings.js";
import { parseSummary } from "../src/parse-summary.js";
import { CONTRACT, EVENT, USER } from "./contracts.js";

const predictionsFixture = fs.readFileSync(path.join(__dirname, "fixtures", `${EVENT.year}-${EVENT.host}-predictions.html`), "utf-8");
const resultsFixture = fs.readFileSync(path.join(__dirname, "fixtures", `${EVENT.year}-${EVENT.host}-results.html`), "utf-8");
const standingssFixture = fs.readFileSync(path.join(__dirname, "fixtures", `${EVENT.year}-summary.html`), "utf-8");

function assertDefined<T>(
  value: T | undefined | null,
  message = "Invariant failed: value is undefined"
): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
}

describe("unit tests", () => {    

    it("should parse predictions correctly", () => {

        const result = parsePredictions(predictionsFixture);

        expect(result.length).toBe(CONTRACT.participants);
        expect(result.every(u => typeof u.userId === "number")).toBe(true);
        expect(result.every(u => typeof u.userName === "string")).toBe(true);
        expect(result.every(u => u.posted instanceof Date)).toBe(true);
        expect(result.every(u => u.prediction.size === CONTRACT.predictionsPerUser)).toBe(true);
    });

    it("should parse results correctly", () => {

        const result = parseStageStandings(resultsFixture);

        expect(result.length).toBe(CONTRACT.participants);
        expect(result.every(u => typeof u.userId === "number")).toBe(true);
        expect(result.every(u => typeof u.userName === "string")).toBe(true);
    });

    it("should keep stable user parsing", () => {

        const result = parsePredictions(predictionsFixture);
        
        const user = result.find(u => u.userId === USER.id);

        assertDefined(user, "User must exist in fixture dataset");
        
        expect(user.userName).toBe(USER.name);
        expect(user.userId).toBe(USER.id);
        expect(user.posted).toEqual(USER.posted);
        expect(user.prediction.get(USER.predPos)).toBe(USER.predPilot);
    });

    it("should parse championship standings correctly", async () => {
        const result = parseSummary(standingssFixture);
        
        expect(result.length).toBe(CONTRACT.standingsParticipants);

        const user = result.find(u => u.userId === USER.id);

        assertDefined(user, "User must exist in fixture dataset");

        expect(user.userName).toBe(USER.name);
        expect(user.teamName).toBe(USER.team);
        expect(user.place).toBe(USER.place);
        expect(user.totalPoints).toBe(CONTRACT.totalPoints);

        user.stages.forEach((stage, index) => {
          stage.points !== null && expect(stage.points).toBe(CONTRACT.stagesPoints[index].points);
          stage.place !== null && expect(stage.place).toBe(CONTRACT.stagesPoints[index].place);
        });
    });
});