export interface YearUrl {
    year: number;
    url: string;
}

export interface EventUrl {
    name: string;
    url: string;
}

export interface UserPrediction {
    userName: string;
    userId: number;
    posted: Date;
    prediction: Map<number, string>;
}

export interface StageStanding {
    place: number;
    userId: number;
    userName: string;
    teamName: string;
    points: number;
    scoreBreakdown: number[];
}

export interface ChampionshipStanding {
    place: number;

    userId: number;
    userName: string;
    teamName: string;

    stages: StagePoints[];

    totalPoints: number;
}

export interface StagePoints {
    points: number | null;
    place: number | null;
}