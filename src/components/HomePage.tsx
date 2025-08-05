// File: src/components/HomePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface President {
  president_id: number;
  full_name: string;
}

export default function HomePage() {
  /* ---------- state ---------- */
  const [query, setQuery] = useState("");
  const [significant, setSignificant] = useState(false);
  const [royalty, setRoyalty] = useState(false);
  const [presidents, setPresidents] = useState<President[]>([]);
  const [presidentId, setPresidentId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/presidents")
      .then((r) => r.json())
      .then(setPresidents)
      .catch(console.error);
  }, []);

  const goToTimeline = () => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (significant) p.set("significant", "1");
    if (royalty) p.set("royalty", "1");
    if (presidentId) p.set("president_id", presidentId);
    navigate(`/voyages${p.toString() ? "?" + p.toString() : ""}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToTimeline();
  };

  /* reusable gradient heading */
  const SectionTitle: React.FC<{ id: string; children: React.ReactNode }> = ({
    id,
    children,
  }) => (
    <h2
      id={id}
      className="text-6xl sm:text-7xl font-extrabold mb-8
                 bg-gradient-to-r from-slate-400 via-sky-400 to-indigo-400
                 bg-clip-text text-transparent"
    >
      {children}
    </h2>
  );

  const glass = "bg-white/20 backdrop-blur-md ring-1 ring-white/30 shadow-lg";

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative flex-grow">
        {/* background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/sequoia-homepage.jpeg)" }}
          aria-hidden="true"
        />
        {/* indigo overlay for contrast */}
        <div className="absolute inset-0 bg-indigo-900/60" aria-hidden="true" />
        {/* content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center text-white">
          {/* ---- HEADLINE (NB-spaces removed so it can wrap) ---- */}
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-4 tracking-tight leading-tight">
            USS Sequoia Archive
          </h1>
          <p className="text-lg mb-10 text-indigo-200">
            Charting a century of presidential voyages
          </p>

          {/* SEARCH CARD ---------------------------------------------------- */}
          <form
            onSubmit={handleSubmit}
            className={`w-full max-w-xl ${glass} rounded-2xl p-6 sm:p-8 space-y-6`}
          >
            <input
              type="text"
              placeholder="Search any keyword to find associated voyages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/70 text-gray-900 placeholder-gray-500 focus:outline-none"
            />

            <select
              value={presidentId}
              onChange={(e) => setPresidentId(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/70 text-gray-900 focus:outline-none"
            >
              <option value="">All administrations</option>
              {presidents.map((p) => (
                <option key={p.president_id} value={p.president_id}>
                  {p.full_name}
                </option>
              ))}
            </select>

            <div className="flex justify-center gap-8">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={significant}
                  onChange={(e) => setSignificant(e.target.checked)}
                />
                <span className="text-sm">Significant</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={royalty}
                  onChange={(e) => setRoyalty(e.target.checked)}
                />
                <span className="text-sm">Royalty</span>
              </label>
            </div>

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
                onClick={goToTimeline}
                className="px-6 py-3 rounded-lg bg-white/30 hover:bg-white/40
                           font-medium transition hover:scale-105"
              >
                Full timeline
              </button>
            </div>
          </form>

          <button
            onClick={() =>
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-12 text-indigo-200 hover:text-white transition"
          >
            Learn more ↓
          </button>
        </div>
      </section>

      {/* ---- LONG-FORM CONTENT (unchanged) ---- */}
      {/* ... everything that was already in the article stays exactly the same ... */}
    </div>
  );
}
