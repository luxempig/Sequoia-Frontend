// File: src/components/VoyageList.tsx
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PresidentFilter from "./PresidentFilter";

interface Voyage {
  voyage_id: number;
  start_timestamp: string;
  end_timestamp: string;
  additional_info: string;
  notes: string;
  significant: number;
  royalty: number;
  president_id: number | null;
  president_name: string | null;
}

const formatRange = (s: string, e: string) => {
  const a = new Date(s);
  const b = new Date(e);
  const same =
    a.toDateString() === b.toDateString() ||
    (isNaN(b.getTime()) && !isNaN(a.getTime()));
  return same
    ? a.toLocaleDateString()
    : `${a.toLocaleDateString()} – ${b.toLocaleDateString()}`;
};

const Badge: React.FC<{
  tone?: "amber" | "violet";
  children: React.ReactNode;
}> = ({ tone = "amber", children }) => {
  const cls =
    tone === "amber"
      ? "bg-amber-100 text-amber-800 ring-amber-200"
      : "bg-violet-100 text-violet-800 ring-violet-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ring-1 ${cls}`}
    >
      {children}
    </span>
  );
};

export default function VoyageList() {
  const [params, setParams] = useSearchParams();
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [localQ, setLocalQ] = useState(params.get("q") || "");
  const [loading, setLoading] = useState(true);

  /* ---- helpers ---- */
  const update = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    v ? next.set(k, v) : next.delete(k);
    setParams(next);
  };
  const handleSearch = () => update("q", localQ);
  const clear = () => {
    [
      "q",
      "significant",
      "royalty",
      "date_from",
      "date_to",
      "president_id",
    ].forEach((k) => params.delete(k));
    setParams(params);
    setLocalQ("");
  };

  /* ---- fetch data ---- */
  useEffect(() => {
    setLoading(true);
    fetch(`/api/voyages${params.toString() ? "?" + params.toString() : ""}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        setVoyages(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        setVoyages([]);
        setLoading(false);
      });
  }, [params]);

  /* ---- group by administration ---- */
  const grouped: Record<string, Voyage[]> = voyages.reduce((acc, v) => {
    const k = v.president_name ?? "Non-presidential";
    (acc[k] ||= []).push(v);
    return acc;
  }, {} as Record<string, Voyage[]>);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* BACK LINK */}
      <Link to="/" className="text-blue-600 hover:underline inline-block mb-4">
        ← Back to home
      </Link>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-end gap-3 mb-6 bg-white/70 p-3 rounded-xl ring-1 ring-gray-200">
        {/* Date & President */}
        <label className="flex items-center gap-2 text-sm">
          <span>From:</span>
          <input
            type="date"
            value={params.get("date_from") || ""}
            onChange={(e) => update("date_from", e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span>To:</span>
          <input
            type="date"
            value={params.get("date_to") || ""}
            onChange={(e) => update("date_to", e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </label>

        <PresidentFilter />

        {/* MORE FILTERS DROPDOWN */}
        <details className="relative">
          <summary className="cursor-pointer text-sm px-3 py-1.5 border rounded bg-gray-100 hover:bg-gray-200 select-none">
            More filters ▾
          </summary>
          <div className="absolute z-20 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-gray-200 p-3 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(params.get("significant"))}
                onChange={(e) =>
                  update("significant", e.target.checked ? "1" : "")
                }
              />
              <span>Significant&nbsp;Voyage</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(params.get("royalty"))}
                onChange={(e) => update("royalty", e.target.checked ? "1" : "")}
              />
              <span>Royalty&nbsp;Aboard</span>
            </label>
          </div>
        </details>

        {/* KEYWORD + BUTTONS */}
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Keyword"
            className="px-3 py-1.5 border rounded w-48"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1.5 rounded bg-stone-700 text-white hover:bg-stone-800"
          >
            Search
          </button>
          <button
            onClick={clear}
            className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* LOADING / EMPTY */}
      {loading && <p className="text-center text-gray-500 py-10">Loading…</p>}
      {!loading && voyages.length === 0 && (
        <p className="text-center text-gray-500 py-10">No voyages found.</p>
      )}

      {/* TIMELINE */}
      {!loading && voyages.length > 0 && (
        <div className="timeline">
          {Object.entries(grouped).map(([hdr, items]) => (
            <section key={hdr} className="mb-8">
              <h2
                className="sticky top-0 z-10 -ml-2 pl-2 pr-3 py-2 mb-3 text-base sm:text-lg font-semibold
                              bg-white/80 backdrop-blur rounded-r-xl ring-1 ring-gray-200 inline-flex"
              >
                {hdr === "Non-presidential"
                  ? "Before / After Presidential Use"
                  : `${hdr} Administration`}
              </h2>

              {items
                .sort(
                  (a, b) =>
                    new Date(a.start_timestamp).getTime() -
                    new Date(b.start_timestamp).getTime()
                )
                .map((v) => (
                  <div key={v.voyage_id} className="timeline-item">
                    <div className="timeline-content w-full">
                      <Link
                        to={`/voyages/${v.voyage_id}`}
                        className="block bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-200 hover:shadow-md transition"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h3 className="text-sm sm:text-base font-semibold">
                            {formatRange(v.start_timestamp, v.end_timestamp)}
                          </h3>
                          <div className="flex gap-2">
                            {v.significant === 1 && <Badge>Significant</Badge>}
                            {v.royalty === 1 && (
                              <Badge tone="violet">Royalty</Badge>
                            )}
                          </div>
                        </div>
                        {v.additional_info && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {v.additional_info}
                          </p>
                        )}
                        {!v.additional_info && v.notes && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {v.notes}
                          </p>
                        )}
                      </Link>
                    </div>
                  </div>
                ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
