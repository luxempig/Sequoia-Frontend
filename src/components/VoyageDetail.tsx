// File: src/components/VoyageDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MediaGallery from "./MediaGallery";

interface Voyage {
  voyage_id: number;
  start_timestamp: string;
  end_timestamp: string;
  president_name: string | null;
  notes: string | null;
  additional_info: string | null;
  significant?: number;
  royalty?: number;
}

interface Passenger {
  passenger_id: number;
  name: string;
  basic_info: string | null;
  bio_path: string | null;
}

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

export default function VoyageDetail() {
  const { id } = useParams<{ id: string }>();
  const voyageId = Number(id);
  const navigate = useNavigate();

  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);

  const safeFetch = async <T,>(url: string, fallback: T): Promise<T> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return fallback;
      return (await res.json()) as T;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [v, p] = await Promise.all([
        safeFetch<Voyage | null>(`/api/voyages/${voyageId}`, null),
        safeFetch<Passenger[]>(`/api/voyages/${voyageId}/passengers`, []),
      ]);
      if (!alive) return;
      setVoyage(v);
      setPassengers(p);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [voyageId]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (!voyage) return <p className="p-4">Voyage not found</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline"
      >
        ← Back to timeline
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl p-5 ring-1 ring-gray-200 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold">
            Voyage {voyage.voyage_id}
          </h1>
          <div className="text-sm sm:text-base text-gray-700">
            <strong>From</strong> {formatDateTime(voyage.start_timestamp)}{" "}
            <strong>to</strong> {formatDateTime(voyage.end_timestamp)}
          </div>
        </div>

        {voyage.president_name && (
          <p className="mt-2 text-gray-700">
            <strong>Presidential ownership:</strong> {voyage.president_name}
          </p>
        )}

        {(voyage.notes || voyage.additional_info) && (
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-1">Notes</h3>
              <p className="text-sm text-gray-700">{voyage.notes || "—"}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-1">Additional Info</h3>
              <p className="text-sm text-gray-700">
                {voyage.additional_info || "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Media */}
      <section className="bg-white rounded-2xl p-5 ring-1 ring-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Media</h3>
        <MediaGallery voyageId={voyageId} />
      </section>

      {/* Passengers */}
      <section className="bg-white rounded-2xl p-5 ring-1 ring-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Passengers</h3>
        {passengers.length === 0 ? (
          <p className="text-gray-600">
            No passengers recorded for this voyage.
          </p>
        ) : (
          <ul className="space-y-2">
            {passengers.map((p) => (
              <li key={p.passenger_id} className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <div className="text-sm">
                  <div className="font-medium">{p.name}</div>
                  {p.basic_info && (
                    <div className="text-gray-700">{p.basic_info}</div>
                  )}
                  {p.bio_path && (
                    <a
                      href={p.bio_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Bio
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
