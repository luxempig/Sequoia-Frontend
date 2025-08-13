// src/components/VoyageList.tsx
import { api } from "../api";
import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

/* ─── types ─────────────────────────────────────────── */
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

/* ─── helpers ───────────────────────────────────────── */
const fmtRange = (s: string, e: string) => {
  const a = new Date(s),
    b = new Date(e);
  return a.toDateString() === b.toDateString() || isNaN(b.getTime())
    ? a.toLocaleDateString()
    : `${a.toLocaleDateString()} – ${b.toLocaleDateString()}`;
};
const Badge: React.FC<{
  tone?: "amber" | "violet";
  children: React.ReactNode;
}> = ({ tone = "amber", children }) => (
  <span
    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ring-1
       ${
         tone === "amber"
           ? "bg-amber-100 text-amber-800 ring-amber-200"
           : "bg-violet-100 text-violet-800 ring-violet-200"
       }`}
  >
    {children}
  </span>
);

/* ─── component ─────────────────────────────────────── */
export default function VoyageList() {
  const [params, setParams] = useSearchParams();

  /* filter state initialised from URL once */
  const [q, setQ] = useState(() => params.get("q") || "");
  const [df, setDF] = useState(() => params.get("date_from") || "");
  const [dt, setDT] = useState(() => params.get("date_to") || "");
  const [pres, setPres] = useState(() => params.get("president_id") || "");
  const [sig, setSig] = useState(params.get("significant") === "1");
  const [roy, setRoy] = useState(params.get("royalty") === "1");

  /* data */
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [presidents, setPrez] = useState<President[]>([]);
  const [loading, setLoading] = useState(true);

  /* dropdown */
  const [moreOpen, setMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  /* fetch presidents once */
  useEffect(() => {
    fetch("/api/presidents")
      .then((r) => r.json())
      .then(setPrez)
      .catch(console.error);
  }, []);

  /* outside-click to close dropdown */
  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setMore(false);
    };
    document.addEventListener("mousedown", close, true);
    return () => document.removeEventListener("mousedown", close, true);
  }, [moreOpen]);

  /* sync local state if URL changes via browser nav */
  useEffect(() => {
    setQ(params.get("q") || "");
    setDF(params.get("date_from") || "");
    setDT(params.get("date_to") || "");
    setPres(params.get("president_id") || "");
    setSig(params.get("significant") === "1");
    setRoy(params.get("royalty") === "1");
  }, [params]);

  /* fetch voyages when URL params change */
  useEffect(() => {
    setLoading(true);
    api
      .listVoyages(params)
      .then((d) => {
        const normalize = (v: any): Voyage => ({
          ...v,
          end_timestamp: v.end_timestamp ?? "",
        });
        setVoyages(Array.isArray(d) ? d.map(normalize) : []);
        setLoading(false);
      })
      .catch(() => {
        setVoyages([]);
        setLoading(false);
      });
  }, [params]);

  /* handlers */
  const apply = (e?: React.FormEvent) => {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (sig) p.set("significant", "1");
    if (roy) p.set("royalty", "1");
    if (df) p.set("date_from", df);
    if (dt) p.set("date_to", dt);
    if (pres) p.set("president_id", pres);
    setParams(p);
    setMore(false);
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

  /* group voyages by administration */
  const grouped = voyages.reduce<Record<string, Voyage[]>>((acc, v) => {
    const k = v.president_name ?? "Non-presidential";
    (acc[k] ||= []).push(v);
    return acc;
  }, {});

  /* ─── render ───────────────────────────────────────── */
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <Link to="/" className="text-blue-600 hover:underline inline-block mb-4">
        ← Back to home
      </Link>

      {/* FILTER BAR */}
      <form
        onSubmit={apply}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
        }}
        className="flex flex-wrap items-end gap-3 mb-6 bg-white/70 p-3 rounded-xl ring-1 ring-gray-200"
      >
        {/* date range */}
        <label className="flex items-center gap-2 text-sm">
          <span>From:</span>
          <input
            type="date"
            value={df}
            onChange={(e) => setDF(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span>To:</span>
          <input
            type="date"
            value={dt}
            onChange={(e) => setDT(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </label>

        {/* president */}
        <label className="flex items-center gap-2 text-sm">
          <span>President:</span>
          <select
            value={pres}
            onChange={(e) => setPres(e.target.value)}
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

        {/* More filters */}
        <div ref={moreRef} className="relative">
          <button
            type="button"
            onClick={() => setMore((o) => !o)}
            className="text-sm px-3 py-1.5 border rounded bg-white/90 text-gray-800 hover:bg-white"
          >
            More filters ▾
          </button>
          {!moreOpen && (
            <span className="ml-2 inline-flex gap-1">
              {sig && <Badge>Significant</Badge>}
              {roy && <Badge tone="violet">Royalty</Badge>}
            </span>
          )}

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

      {/* STATES / TIMELINE */}
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
