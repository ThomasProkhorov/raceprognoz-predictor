export const EVENT = {
  year: 2026,
  host: 'austria',
} as const;

export const PRE_URL = `https://raceprognoz.ru/formula1/usersprognozs/${EVENT.year}/${EVENT.host}.php`;
export const RES_URL = `https://raceprognoz.ru/formula1/results/${EVENT.year}/${EVENT.host}.php`;

export const CONTRACT = {
  participants: 42,
  predictionsPerUser: 8,
  eventsCount: 18,
  minYear: 2006,
  host: 'brazil',
  standingsParticipants: 48,
  totalPoints: 671,
  stagesPoints: [ {points: 83, place: 25}, 
                  {points: 93, place: 7}, 
                  {points: 86, place: 39}, 
                  {points: 95, place: 13}, 
                  {points: 65, place: 22}, 
                  {points: 44, place: 23}, 
                  {points: 82, place: 13}, 
                  {points: 123, place: 1}]
} as const;

export const USER = {
  id: 2809,
  name: 'Thomas ',
  team: 'Thomas',
  posted: new Date('2026-06-27T13:48:27.000Z'),
  predPos: 1,
  predPilot: 'George Russell',
  place: 4
} as const satisfies {
  id: number;
  name: string;
  team: string;
  posted: Date;
  predPos: number;
  predPilot: string;
  place: number;
};
