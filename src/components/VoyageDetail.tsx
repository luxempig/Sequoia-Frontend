import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function VoyageDetail() {
  const { id } = useParams<{id: string}>();
  const [voyage, setVoyage]     = useState<any>(null);
  const [media,   setMedia]     = useState<any[]>([]);
  const [passengers, setPassengers] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/voyages/${id}`).then(r => r.json()),
      fetch(`/api/voyages/${id}/media`).then(r => r.json()),
      fetch(`/api/voyages/${id}/passengers`).then(r => r.json()),
    ]).then(([v, m, p]) => {
      setVoyage(v);
      setMedia(m);
      setPassengers(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!voyage)  return <p>Voyage not found</p>;

  return (
    <div className="p-4">
      <Link to="/" className="text-blue-500 hover:underline">← Back to timeline</Link>

      <h1>
  Voyage {voyage.voyage_id}:{" "}
  {new Date(voyage.start_timestamp)
      .toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      })}{" "}
  –{" "}
  {new Date(voyage.end_timestamp)
      .toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      })}
</h1>


      <p className="mb-4"><strong>Notes:</strong> {voyage.notes}</p>
      <p className="mb-6"><strong>Additional Info:</strong> {voyage.additional_info}</p>

      <h3 className="text-xl font-semibold">Media</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {media.map(item => (
          <figure key={item.source_id}>
            <img
              src={item.source_path}
              alt={item.source_description || 'Voyage media'}
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

      <h3 className="text-xl font-semibold">Passengers</h3>
      <ul className="list-disc list-inside">
        {passengers.map(p => (
          <li key={p.passenger_id}>
            <strong>{p.name}</strong><br/>
            {p.basic_info}<br/>
            <a
              href={p.bio_path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View bio
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}