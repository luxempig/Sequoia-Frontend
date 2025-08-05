// src/components/HomePage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface President {
  president_id: number;
  full_name: string;
}

export default function HomePage() {
  /* ─── state ─────────────────────────────────────────────────────────── */
  const [query, setQuery] = useState("");
  const [significant, setSig] = useState(false);
  const [royalty, setRoy] = useState(false);
  const [presidentId, setPres] = useState("");
  const [presidents, setList] = useState<President[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  /* ─── fetch president options once ──────────────────────────────────── */
  useEffect(() => {
    fetch("/api/presidents")
      .then((r) => r.json())
      .then(setList)
      .catch(console.error);
  }, []);

  /* ─── close dropdown if click / tap outside ─────────────────────────── */
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) document.addEventListener("click", close, true);
    return () => document.removeEventListener("click", close, true);
  }, [moreOpen]);

  /* ─── helpers ───────────────────────────────────────────────────────── */
  const buildParamString = () => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (significant) p.set("significant", "1");
    if (royalty) p.set("royalty", "1");
    if (presidentId) p.set("president_id", presidentId);
    return p.toString();
  };

  const goSearch = () => {
    setMoreOpen(false);
    const qs = buildParamString();
    navigate(`/voyages${qs ? `?${qs}` : ""}`);
  };

  const goFullTimeline = () => {
    /* always unfiltered */
    setMoreOpen(false);
    navigate("/voyages");
  };

  /* ─── glass card style token ────────────────────────────────────────── */
  const glass = "bg-white/20 backdrop-blur-md ring-1 ring-white/30 shadow-lg";

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* ─────────── HERO ─────────── */}
      <section className="relative flex-grow">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/sequoia-homepage.jpeg)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-indigo-900/60" aria-hidden />

        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center text-white">
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-4 tracking-tight leading-tight">
            USS Sequoia Archive
          </h1>
          <p className="text-lg mb-10 text-indigo-200">
            Charting a century of presidential voyages
          </p>

          {/* ───── SEARCH CARD ───── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goSearch();
            }}
            className={`w-full max-w-xl ${glass} rounded-2xl p-6 sm:p-8 space-y-6`}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any keyword to find associated voyages…"
              className="w-full p-3 rounded-lg bg-white/70 text-gray-900 placeholder-gray-500 focus:outline-none"
            />

            <select
              value={presidentId}
              onChange={(e) => setPres(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/70 text-gray-900"
            >
              <option value="">All administrations</option>
              {presidents.map((p) => (
                <option key={p.president_id} value={p.president_id}>
                  {p.full_name}
                </option>
              ))}
            </select>

            {/* ───── More filters dropdown ───── */}
            <div className="relative mx-auto" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                className="cursor-pointer text-sm px-3 py-1.5 border rounded
                           bg-white/90 text-gray-800 hover:bg-white/100 select-none"
              >
                More filters ▾
              </button>

              {moreOpen && (
                <div
                  className="absolute z-20 mt-2 w-56 left-1/2 -translate-x-1/2
                             bg-white text-gray-800 rounded-lg shadow-lg ring-1 ring-gray-200 p-3 space-y-2"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={significant}
                      onChange={(e) => setSig(e.target.checked)}
                    />
                    <span>Significant Voyage</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={royalty}
                      onChange={(e) => setRoy(e.target.checked)}
                    />
                    <span>Royalty Aboard</span>
                  </label>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-indigo-600/80 hover:bg-indigo-600
                           font-medium transition hover:scale-105"
              >
                Search
              </button>
              <button
                type="button"
                onClick={goFullTimeline}
                className="px-6 py-3 rounded-lg bg-white/30 hover:bg-white/40
                           font-medium transition hover:scale-105"
              >
                Full timeline
              </button>
            </div>
          </form>

          {/* anchor link for “Learn more” */}
          <a
            href="#about"
            className="mt-12 text-indigo-200 hover:text-white transition"
          >
            Learn more ↓
          </a>
        </div>
      </section>

      {/* ─────────── LONG-FORM CONTENT (restored) ─────────── */}
      <article className="bg-white text-gray-800 leading-relaxed">
        {/* ABOUT */}
        <section id="about" className="max-w-4xl mx-auto py-20 px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">About</h2>
          <p>
            The USS <i>Sequoia</i> carried nine U.S. presidents between 1929 and
            1977. Cabinet meetings, diplomatic gambits, even a secret birthday
            party—history floated down the Potomac on her decks. This site
            gathers every known voyage, logbook, photograph, and passenger list
            into a single open archive.
          </p>
        </section>

        {/* ARCHIVE */}
        <section id="archive" className="max-w-4xl mx-auto py-20 px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
            The Archive
          </h2>
          <p>
            We treat the yacht’s logbooks as primary texts, transcribing them
            line-for-line, then linking each entry to press coverage, archival
            photographs, and biographical notes. A relational database powers
            the public API you’re exploring now—filterable by date,
            significance, presidential ownership, and onboard guests.
          </p>
        </section>

        {/* (other sections trimmed for brevity – keep yours as needed) */}
      </article>
    </div>
  );
}
