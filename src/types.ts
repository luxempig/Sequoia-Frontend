// src/types.ts
export interface President {
  president_id: number;
  full_name: string;
  term_start: string; // ISO date
  term_end: string | null; // ISO or null
  party?: string | null;
  notes?: string | null;
}

export interface Voyage {
  voyage_id: number;
  start_timestamp: string;
  end_timestamp: string | null;
  additional_info: string | null;
  notes: string | null;
  significant?: number | boolean;
  royalty?: number | boolean;
  president_id?: number | null;
  president_name?: string | null;
}

export interface Passenger {
  passenger_id: number;
  name: string;
  basic_info: string | null;
  bio_path: string | null;
}

export interface MediaSource {
  source_id: number;
  source_path: string;
  source_description: string | null;
  source_type: string;
  source_origin: string | null;
  page_num?: number | null;
}
