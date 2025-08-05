import React, { useState, useEffect, useRef } from "react";
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

const fmt = (s: string, e: string) => {
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
  const init = (k: string) => params.get(k) || "";
  const [q, setQ] = useState(init("q"));
  const [dateFrom, setDF] = useState(init("date_from"));
  const [dateTo, setDT] = useState(init("date_to"));
  const [pres, setPres] = useState(init("president_id"));
  const [sig, setSig] = useState(params.get("significant") === "1");
  const [roy, setRoy] = useState(params.get("royalty") === "1");

  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);

  /* re-sync local state when URL changes (back/forward) */
  useEffect(() => {
    setQ(init("q"));
    setDF(init("date_from"));
    setDT(init("date_to"));
    setPres(init("president_id"));
    setSig(params.get("significant") === "1");
    setRoy(params.get("royalty") === "1");
  }, [params]);

  /* dropdown open handling */
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [moreOpen]);

  /* fetch when URL params change */
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

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (sig) p.set("significant", "1");
    if (roy) p.set("royalty", "1");
    if (dateFrom) p.set("date_from", dateFrom);
    if (dateTo) p.set("date_to", dateTo);
    if (pres) p.set("president_id", pres);
    setParams(p);
    setMoreOpen(false);
  };

  const clear = () => {
    setQ("");
    setDF("");
    setDT("");
    setPres("");
    setSig(false);
    setRoy(false);
    setParams(new URLSearchParams());
  };

  /* group by administration */
  const grouped: Record<string, Voyage[]> = voyages.reduce((a, v) => {
    const k = v.president_name ?? "Non-presidential";
    (a[k] ||= []).push(v);
    return a;
  }, {});

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <Link to="/" className="text-blue-600 hover:underline inline-block mb-4">
        ← Back to home
      </Link>

      {/* ---------- FILTER BAR ---------- */}
      <form
        onSubmit={submit}
        className="flex flex-wrap items-end gap-3 mb-6 bg-white/70 p-3 rounded-xl ring-1 ring-gray-200"
      >
        {/* date & president */}
        <label className="flex items-center gap-2 text-sm">
          <span>From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDF(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span>To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDT(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </label>

        <PresidentFilter /* uses URL param so we proxy changes */ />

        {/* --- More Filters dropdown --- */}
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
                  checked={sig}
                  onChange={(e) => setSig(e.target.checked)}
                />
                <span>Significant Voyage</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={roy}
                  onChange={(e) => setRoy(e.target.checked)}
                />
                <span>Royalty Aboard</span>
              </label>
            </div>
          )}
        </div>

        {/* keyword + buttons */}
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
            onClick={clear}
            className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200"
          >
            Clear
          </button>
        </div>
      </form>

      {/* ---------- STATES / TIMELINE ---------- */}
      {loading && <p className="text-center text-gray-500 py-10">Loading…</p>}
      {!loading && voyages.length === 0 && (
        <p className="text-center text-gray-500 py-10">No voyages found.</p>
      )}

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
                            {fmt(v.start_timestamp, v.end_timestamp)}
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
