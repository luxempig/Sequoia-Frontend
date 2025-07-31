// File: src/components/HomePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface President {
  president_id: number;
  full_name: string;
  term_start: string;
  term_end: string;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [significant, setSignificant] = useState(false);
  const [royalty, setRoyalty] = useState(false);
  const [presidents, setPresidents] = useState<President[]>([]);
  const [presidentId, setPresidentId] = useState<string>(""); // "" = all
  const navigate = useNavigate();

  /* fetch presidents once */
  useEffect(() => {
    fetch("/api/presidents")
      .then((r) => r.json())
      .then(setPresidents)
      .catch(console.error);
  }, []);

  /* build URL and go */
  const goToTimeline = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (significant) params.set("significant", "1");
    if (royalty) params.set("royalty", "1");
    if (presidentId) params.set("president_id", presidentId);
    navigate(`/voyages${params.toString() ? "?" + params.toString() : ""}`);
  };

  /* form submit */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToTimeline();
  };

  return (
    <div className="min-h-screen bg-oak flex flex-col text-white">
      {/* ---------- HERO ---------- */}
      <section className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-6xl font-extrabold mb-4">
          USS&nbsp;Sequoia&nbsp;Historical Archive
        </h1>
        <p className="text-lg mb-8">Welcome aboard.</p>

        {/* ---------- SEARCH FORM ---------- */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-stone-300 bg-opacity-90 rounded-lg shadow p-6 flex flex-col space-y-4"
        >
          <input
            type="text"
            placeholder="Search voyages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="p-3 bg-stone-100 text-gray-800 border border-gray-300 rounded-lg focus:outline-none"
          />

          {/* PRESIDENT SELECT */}
          <select
            value={presidentId}
            onChange={(e) => setPresidentId(e.target.value)}
            className="p-3 bg-stone-100 text-gray-800 border border-gray-300 rounded-lg focus:outline-none"
          >
            <option value="">All administrations</option>
            {presidents.map((p) => (
              <option key={p.president_id} value={p.president_id}>
                {p.full_name}
              </option>
            ))}
          </select>

          {/* CHECKBOXES */}
          <div className="flex justify-center space-x-8">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={significant}
                onChange={(e) => setSignificant(e.target.checked)}
              />
              <span className="text-white">Significant only</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={royalty}
                onChange={(e) => setRoyalty(e.target.checked)}
              />
              <span className="text-white">Royalty onboard</span>
            </label>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="px-6 py-3 bg-stone-600 text-white rounded-lg font-medium hover:opacity-90"
            >
              Search
            </button>
            <button
              type="button"
              onClick={goToTimeline}
              className="px-6 py-3 bg-stone-500 text-white rounded-lg font-medium hover:opacity-90"
            >
              View full voyage timeline
            </button>
          </div>
        </form>

        {/* scroll-down link */}
        <button
          onClick={() =>
            document
              .getElementById("about")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="mt-8 text-white font-medium hover:underline"
        >
          Learn more ↓
        </button>
      </section>

      {/* ---------- ABOUT ---------- */}
      <section id="about" className="bg-white py-16 px-8 text-gray-900">
        <h2 className="text-4xl font-semibold mb-4">About</h2>
        <p className="max-w-3xl leading-relaxed">
          This project showcases an interactive archive of presidential voyages
          aboard the USS&nbsp;Sequoia. Filter by president, date, or keyword to
          explore detailed itineraries, passenger lists, and historical media.
        </p>
      </section>
    </div>
  );
}
