// File: src/components/HomePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface President {
  president_id: number;
  full_name: string;
}

export default function HomePage() {
  /* ---------------- state ---------------- */
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

  /* ---------------- helpers ---------------- */
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

  /* gradient heading helper */
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

  /* card backdrop style for hero box */
  const glass =
    "bg-white/20 backdrop-blur-md ring-1 ring-white/30 shadow-lg";

  /* ---------------- render ---------------- */
  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO */}
      <section
        className="flex-grow flex flex-col items-center justify-center p-8 text-center
                   bg-gradient-to-b from-indigo-900 to-indigo-700 text-white"
      >
        <h1 className="text-6xl sm:text-7xl font-extrabold mb-4 tracking-tight">
          USS&nbsp;Sequoia&nbsp;Archive
        </h1>
        <p className="text-lg mb-10 text-indigo-200">
          Charting a century of presidential voyages
        </p>

        {/* SEARCH CARD */}
        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-xl ${glass} rounded-2xl p-8 space-y-6`}
        >
          {/* text search */}
          <input
            type="text"
            placeholder="Keyword…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/70 text-gray-900 placeholder-gray-500 focus:outline-none"
          />

          {/* president selector */}
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

          {/* toggles */}
          <div className="flex justify-center gap-10">
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

          {/* buttons */}
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
      </section>

      {/* LONG‐FORM CONTENT */}
      <article className="bg-white text-gray-800 leading-relaxed">
        {/* ABOUT */}
        <section id="about" className="max-w-4xl mx-auto py-20 px-6">
          <SectionTitle id="about">About</SectionTitle>
          <p>
            The USS <i>Sequoia</i> carried nine U.S.&nbsp;presidents between
            1929 and 1977. Cabinet meetings, diplomatic gambits, even a secret
            birthday party—history floated down the Potomac on her decks. This
            site gathers every known voyage, logbook, photograph, and passenger
            list into a single open archive.
          </p>
        </section>

        {/* ARCHIVE */}
        <section className="max-w-4xl mx-auto py-20 px-6">
          <SectionTitle id="archive">The Archive</SectionTitle>
          <p>
            We treat the yacht’s logbooks as primary texts, transcribing them
            line-for-line, then linking each entry to press coverage, archival
            photographs, and biographical notes. A relational database powers
            the public API you’re exploring now—filterable by date,
            significance, presidential ownership, and onboard guests.
          </p>
        </section>

        {/* HISTORY */}
        <section className="max-w-4xl mx-auto py-20 px-6">
          <SectionTitle id="history">History</SectionTitle>
          <p>
            Launched in 1925, purchased by the U.S.&nbsp;Government in 1931, the{" "}
            <i>Sequoia</i> witnessed Hoover’s fishing trips, FDR’s New Deal
            drafts, JFK’s birthday serenades, and Nixon’s “smoking-gun” weekend
            cruise. Decommissioned in 1977, she survived private ownership and
            storm damage; today restoration continues. Our focus is the
            presidential era, when national policy was literally afloat.
          </p>
        </section>

        {/* AIMS */}
        <section className="max-w-4xl mx-auto py-20 px-6">
          <SectionTitle id="aims">Aims &amp; Status</SectionTitle>
          <p>
            We aim to be the citation-ready reference for scholars of American
            political history, maritime heritage, and White House material
            culture. The dataset updates continuously; a deck-plan explorer and
            OCR search of all logbook scans are slated for 2025. Contributions
            and corrections are welcome via GitHub.
          </p>
        </section>

        {/* COPYRIGHT */}
        <section className="max-w-4xl mx-auto py-20 px-6">
          <SectionTitle id="copyright">Copyright</SectionTitle>
          <p>
            Transcriptions and metadata are released under&nbsp;
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="text-indigo-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC-BY 4.0
            </a>
            . High-resolution images remain under the licences of their holding
            archives; follow the credit line on each item. If you reuse large
            portions of the dataset, please cite “USS Sequoia Historical
            Archive v{process.env.REACT_APP_VERSION || "latest"}.”
          </p>
        </section>

        {/* HOW TO CITE */}
        <section className="max-w-4xl mx-auto py-20 px-6">
          <SectionTitle id="cite">How&nbsp;to&nbsp;Cite</SectionTitle>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Use the “Permalink” under any scan to cite a specific logbook
              page.
            </li>
            <li>
              Cite transcriptions by voyage ID and timestamp
              (e.g.&nbsp;“Voyage 42, 1934-06-20 → 1934-06-22”).
            </li>
            <li>
              Bulk researchers can download nightly CSV exports from our GitHub
              releases.
            </li>
          </ul>
        </section>

        {/* FOOTER */}
        <footer className="bg-gray-50 py-16 px-6">
          <div className="max-w-4xl mx-auto text-sm text-gray-700 space-y-3">
            <p>
              Site created by the&nbsp;<i>labour and valour</i> of
              <strong> Daniel&nbsp;Freymann </strong>
              © {new Date().getFullYear()}.
            </p>
            <p>
              Built with React, TailwindCSS, and FastAPI; hosted on AWS Lightsail
              with gratitude to the historians and archivists who keep the
              <i>Sequoia</i>’s story afloat.
            </p>
          </div>
        </footer>
      </article>
    </div>
  );
}
