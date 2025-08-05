// File: src/components/VoyageList.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

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

interface President {
  president_id: number;
  full_name: string;
}

/* ---------- small helpers ---------- */
const fmtRange = (s: string, e: string) => {
  const a = new Date(s),
    b = new Date(e);
  const same = a.toDateString() === b.toDateString() || isNaN(b.getTime());
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
      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ring-1 ${cls}`}
    >
      {children}
    </span>
  );
};

export default function VoyageList() {
  const [params, setParams] = useSearchParams();

  /* ---- local filter state (initialised from URL) ---- */
  const [q, setQ] = useState(() => params.get("q") || "");
  const [dateFrom, setDateFrom] = useState(() => params.get("date_from") || "");
  const [dateTo, setDateTo] = useState(() => params.get("date_to") || "");
  const [presidentId, setPresidentId] = useState(
    () => params.get("president_id") || ""
  );
  const [significant, setSignificant] = useState(
    params.get("significant") === "1"
  );
  const [royalty, setRoyalty] = useState(params.get("royalty") === "1");

  /* ---- data ---- */
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [presidents, setPresidents] = useState<President[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---- “More filters” dropdown state ---- */
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  /* fetch presidents once */
  useEffect(() => {
    fetch("/api/presidents")
      .then((r) => r.json())
      .then(setPresidents)
      .catch(console.error);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  /* keep local state in sync if user navigates back/forward */
  useEffect(() => {
    setQ(params.get("q") || "");
    setDateFrom(params.get("date_from") || "");
    setDateTo(params.get("date_to") || "");
    setPresidentId(params.get("president_id") || "");
    setSignificant(params.get("significant") === "1");
    setRoyalty(params.get("royalty") === "1");
  }, [params]);

  /* fetch voyages whenever URL params change */
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

  /* ---------- handlers ---------- */
  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (significant) p.set("significant", "1");
    if (royalty) p.set("royalty", "1");
    if (dateFrom) p.set("date_from", dateFrom);
    if (dateTo) p.set("date_to", dateTo);
    if (presidentId) p.set("president_id", presidentId);
    setParams(p);
    setMoreOpen(false);
  };

  const clearFilters = () => {
    setQ("");
    setDateFrom("");
    setDateTo("");
    setPresidentId("");
    setSignificant(false);
    setRoyalty(false);
    setParams(new URLSearchParams());
  };

  /* ---------- group voyages by administration ---------- */
  const grouped = voyages.reduce<Record<string, Voyage[]>>((acc, v) => {
    const key = v.president_name ?? "Non-presidential";
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  /* ---------- render ---------- */
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <Link to="/" className="text-blue-600 hover:underline inline-block mb-4">
        ← Back to home
      </Link>

      {/* FILTER BAR */}
      <form
        onSubmit={applyFilters}
        className="flex flex-wrap items-end gap-3 mb-6 bg-white/70 p-3 rounded-xl ring-1 ring-gray-200"
      >
        <label className="flex items-center gap-2 text-sm">
          <span>From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span>To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </label>

        {/* President dropdown */}
        <label className="flex items-center gap-2 text-sm">
          <span>President:</span>
          <select
            value={presidentId}
            onChange={(e) => setPresidentId(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="">All</option>
            {presidents.map((p) => (
              <option key={p.president_id} value={p.president_id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </label>

        {/* More filters dropdown */}
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className="cursor-pointer text-sm px-3 py-1.5 border rounded bg-gray-100 hover:bg-gray-200"
          >
            More filters ▾
          </button>

          {moreOpen && (
            <div className="absolute z-20 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-lg ring-1 ring-gray-200 p-3 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={significant}
                  onChange={(e) => setSignificant(e.target.checked)}
                />
                <span>Significant Voyage</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={royalty}
                  onChange={(e) => setRoyalty(e.target.checked)}
                />
                <span>Royalty Aboard</span>
              </label>
            </div>
          )}
        </div>

        {/* Keyword + buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Keyword"
            className="px-3 py-1.5 border rounded w-48"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-stone-700 text-white hover:bg-stone-800"
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </form>

      {/* STATES / TIMELINE */}
      {loading && <p className="text-center text-gray-500 py-10">Loading…</p>}
      {!loading && voyages.length === 0 && (
        <p className="text-center text-gray-500 py-10">No voyages found.</p>
      )}

      {!loading && voyages.length > 0 && (
        <div className="timeline">
          {Object.entries(grouped).map(([header, items]) => (
            <section key={header} className="mb-8">
              <h2
                className="sticky top-0 z-10 -ml-2 pl-2 pr-3 py-2 mb-3 text-base sm:text-lg font-semibold
                              bg-white/80 backdrop-blur rounded-r-xl ring-1 ring-gray-200 inline-flex"
              >
                {header === "Non-presidential"
                  ? "Before / After Presidential Use"
                  : `${header} Administration`}
              </h2>

              {items
                .sort(
                  (a, b) =>
                    +new Date(a.start_timestamp) - +new Date(b.start_timestamp)
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
                            {fmtRange(v.start_timestamp, v.end_timestamp)}
                          </h3>
                          <div className="flex gap-2">
                            {v.significant === 1 && <Badge>Significant</Badge>}
                            {v.royalty === 1 && (
                              <Badge tone="violet">Royalty</Badge>
                            )}
                          </div>
                        </div>
                        {(v.additional_info || v.notes) && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {v.additional_info || v.notes}
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
