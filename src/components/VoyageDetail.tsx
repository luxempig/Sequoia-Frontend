// File: src/components/VoyageDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Media {
  source_id: number;
  source_path: string;
  source_description: string | null;
  source_type: string;
  source_origin: string | null;
  page_num?: number | null;
}

interface Passenger {
  passenger_id: number;
  name: string;
  basic_info: string | null;
  bio_path: string | null;
}

export default function VoyageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [voyage, setVoyage] = useState<any>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);

  /** fetch JSON but turn 404 into [] so the UI never crashes */
  const safeFetch = <T,>(url: string): Promise<T | []> =>
    fetch(url).then((res) => (res.ok ? res.json() : []));

  useEffect(() => {
    Promise.all([
      fetch(`/api/voyages/${id}`).then((r) => r.json()),
      safeFetch<Media[]>(`/api/voyages/${id}/media`),
      safeFetch<Passenger[]>(`/api/voyages/${id}/passengers`),
    ])
      .then(([v, m, p]) => {
        setVoyage(v);
        setMedia(Array.isArray(m) ? m : []);
        setPassengers(Array.isArray(p) ? p : []);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (!voyage) return <p className="p-4">Voyage not found</p>;

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-500 hover:underline"
      >
        ← Back to timeline
      </button>

      <h1 className="text-2xl font-semibold mt-4 mb-2">
        Voyage {voyage.voyage_id}:{" "}
        {new Date(voyage.start_timestamp).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}{" "}
        –{" "}
        {new Date(voyage.end_timestamp).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </h1>

      {voyage.president_name && (
        <p className="mb-2 text-gray-700">
          <strong>Presidential ownership:</strong> {voyage.president_name}
        </p>
      )}

      <p className="mb-4">
        <strong>Notes:</strong> {voyage.notes || "—"}
      </p>
      <p className="mb-6">
        <strong>Additional Info:</strong> {voyage.additional_info || "—"}
      </p>

      {/* ---------- MEDIA ---------- */}
      <h3 className="text-xl font-semibold">Media</h3>
      {media.length === 0 ? (
        <p className="text-gray-600 mb-6">No media for this voyage.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {media.map((item) => (
            <figure key={item.source_id}>
              <img
                src={item.source_path}
                alt={item.source_description || "Voyage media"}
                className="max-w-full rounded shadow"
              />
              <figcaption className="text-sm text-gray-600 mt-1">
                {item.source_type} — {item.source_origin}
                {item.page_num && ` (page ${item.page_num})`}
                {item.source_description && `: ${item.source_description}`}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* ---------- PASSENGERS ---------- */}
      <h3 className="text-xl font-semibold">Passengers</h3>
      {passengers.length === 0 ? (
        <p className="text-gray-600">No passengers recorded for this voyage.</p>
      ) : (
        <ul className="list-disc list-inside space-y-1">
          {passengers.map((p) => (
            <li key={p.passenger_id}>
              <strong>{p.name}</strong>
              {p.basic_info && <> — {p.basic_info}</>}
              {p.bio_path && (
                <>
                  {" "}
                  <a
                    href={p.bio_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Bio
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
