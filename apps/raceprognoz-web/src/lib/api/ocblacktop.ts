const API_BASE = "https://api.ocblacktop.com/v1";

function getApiKey(): string {
  const key = process.env.OCBLACKTOP_API_KEY;
  if (!key) throw new Error("OCBLACKTOP_API_KEY environment variable is not set");
  return key;
}

async function fetchApi<T>(path: string, revalidate: number = 60): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "x-api-key": getApiKey(),
      "Content-Type": "application/json",
    },
    cache: "no-store",
    //next: { revalidate },
  });
  if (!res.ok) throw new Error(`ocblacktop API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export interface ParticipationTeams {
  id: string;
  name: string;
  color: string;
  shortName: string;
  participationRounds: number[];
}

export interface Driver {
  id: string;
  position: number;
  points: number;
  firstName: string;
  lastName: string;
  code: string;
  number: number;
  teams: ParticipationTeams[];
}

export interface Team {
  id: string;
  position: number;
  points: number;
  name: string;
  shortName: string;
  color: string;
}

export interface EventCountry {
  name: string;
  twoCode: string;
  threeCode: string;
}

export interface EventLocation {
  id: string;
  name: string;
  city: string;
  country: EventCountry;
}

export interface Event {
  id: string;
  name: string;
  dateStart: Date;
  dateEnd: Date;
  status: string;
  location: EventLocation;
}

export interface Session {
  id: string;
  name: string;
  type: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

export interface EventDetails extends Event {
  sportId: string;
  season: Season;
  previousEventId: string;
  nextEventId: string;
  schedule: Session[];
}

export interface Season {
  id: string;
  name: string;
  year: number;
  sportId: string;
  status: string;
  roundCount: number;
}

export interface Pagination { 
  page: number; 
  limit: number; 
  total: number; 
  totalPages: number 
}

export interface SeasonsApiResponse {
  data: Season[];
  meta: Pagination;
}

export interface SeasonDetailsApiResponse {
  season: Season;
  drivers: Driver[];
  teams: Team[];
  schedule: Event[];
}

export interface Results {
  id: string;
  position: string;
  driver: Driver;
  team: Team;
  laps: number;
  gap: string | null;
  gridPosition: number | null;
}

export async function getSeason(year: number): Promise<Season> {
  let response = { data: [] as Season[], meta: { page: 0, limit: 100, total: 0, totalPages: 1 } as Pagination };  
  let current = undefined as Season | undefined;
  
  while (!current && response.meta.page < response.meta.totalPages) {
    response = await fetchApi<SeasonsApiResponse>(`/formula1/seasons?page=${response.meta.page + 1}&limit=${response.meta.limit}`, 3600*24);
    current = response.data.find((season) => season.year === year);
  }

  if (!current) throw new Error("Current season not found");
  return current;
}

export async function getSeasonDetails(id: string): Promise<SeasonDetailsApiResponse> {  
  const response = await fetchApi<SeasonDetailsApiResponse>(`/formula1/seasons/${id}`, 3600*24);
  return response;
}

export async function getEventDetails(id: string): Promise<EventDetails> {  
  const response = await fetchApi<EventDetails>(`/formula1/events/${id}`, 3600*24);
  return response;
}

export async function getLastSession(id: string): Promise<Session> {
  const response = await fetchApi<EventDetails>(`/formula1/events/${id}`, 3600*24);
  const completedSessions = response.schedule.filter((s) => s.status === "completed");
  return completedSessions[completedSessions.length - 1];
}

export async function getResults(eventId: string, sessionId: string): Promise<Results[]> {
  return fetchApi<Results[]>(`/formula1/events/${eventId}/sessions/${sessionId}/results`);
}