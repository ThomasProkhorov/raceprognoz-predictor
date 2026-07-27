export const DIFF_SCORE: Record<number, number> = {
  0: 25, 1: 15, 2: 10, 3: 8, 4: 6, 5: 4, 6: 2, 7: 1,
};

export interface LiveResult {
  position: string | undefined;
  driverCode: string | undefined;
  driverName: string | undefined;  
  team: string | null | undefined;
  time: string | null;
  points: string | null;
}

export interface ScoredEntry {
  userId: number;
  userName: string;
  prediction: Map<number, string>;
  total: number;
  details: Map<number, number>;
}

export function scorePredictions(
  prediction: Map<number, string>,
  results: LiveResult[],
): { total: number; details: Map<number, number> } {
  let total = 0;
  const details = new Map<number, number>();

  for (const [predPos, driverName] of prediction) {
    const actual = results.find((r) => r.driverName === driverName);
    if (actual) {
      const actualPos = Number(actual.position);
      const diff = Math.abs(predPos - actualPos);
      const pts = DIFF_SCORE[diff] ?? 0;
      total += pts;
      details.set(predPos, pts);
    } else {
      details.set(predPos, 0);
    }
  }

  return { total, details };
}
