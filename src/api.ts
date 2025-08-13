// src/api.ts
import { President, Voyage, Passenger, MediaSource } from "./types";

const API_BASE = ""; // CRA proxy forwards to backend, so empty base is fine
const TIMEOUT = 15000;

async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

/** Presidents */
export const api = {
  listPresidents: () => getJSON<President[]>("/api/presidents"),
  voyagesByPresident: (id: number) =>
    getJSON<Voyage[]>(`/api/presidents/${id}/voyages`),

  /** Voyages (filters match your backend) */
  listVoyages: (params: URLSearchParams) =>
    getJSON<Voyage[]>(`/api/voyages${params.toString() ? "?" + params : ""}`),
  getVoyage: (id: number) => getJSON<Voyage>(`/api/voyages/${id}`),
  getVoyagePassengers: (id: number) =>
    getJSON<Passenger[]>(`/api/voyages/${id}/passengers`),
  getVoyageMedia: (id: number) =>
    getJSON<MediaSource[]>(`/api/voyages/${id}/media`),
};
