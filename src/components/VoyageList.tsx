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

const VoyageList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [localQ, setLocalQ] = useState(searchParams.get("q") || "");

  // helper to patch a single URL param
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set(key, value) : next.delete(key);
    setSearchParams(next);
  };

  // only push text search on click
  const handleSearch = () => updateParam("q", localQ);

  // fetch voyages whenever params change
  useEffect(() => {
    const qs = searchParams.toString();
    fetch(`/api/voyages${qs ? "?" + qs : ""}`)
      .then((r) => r.json())
      .then(setVoyages)
      .catch((e) => {
        console.error("API error:", e);
        setVoyages([]);
      });
  }, [searchParams]);

  /* ---------- group voyages by president_name ---------- */
  const grouped: Record<string, Voyage[]> = voyages.reduce((acc, v) => {
    const key = v.president_name ?? "Non-presidential";
    (acc[key] ||= []).push(v);
    return acc;
  }, {} as Record<string, Voyage[]>);

  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) =>
      (a === "Non-presidential" ? 1 : 0) - (b === "Non-presidential" ? 1 : 0)
  );

  return (
    <div className="voyage-list-container">
      {/* ----- FILTER BAR ----- */}
      <div className="filters items-center">
        <label>
          <input
            type="checkbox"
            checked={Boolean(searchParams.get("significant"))}
            onChange={(e) =>
              updateParam("significant", e.target.checked ? "1" : "")
            }
          />{" "}
          Significant
        </label>
        <label>
          <input
            type="checkbox"
            checked={Boolean(searchParams.get("royalty"))}
            onChange={(e) =>
              updateParam("royalty", e.target.checked ? "1" : "")
            }
          />{" "}
          Royalty onboard
        </label>
        <label>
          From:{" "}
          <input
            type="date"
            value={searchParams.get("date_from") || ""}
            onChange={(e) => updateParam("date_from", e.target.value)}
          />
        </label>
        <label>
          To:{" "}
          <input
            type="date"
            value={searchParams.get("date_to") || ""}
            onChange={(e) => updateParam("date_to", e.target.value)}
          />
        </label>

        {/* president dropdown */}
        <PresidentFilter />

        {/* text search */}
        <input
          type="text"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          placeholder="Keyword"
          className="ml-2 p-1 border rounded"
        />
        <button
          onClick={handleSearch}
          className="ml-2 px-3 py-1 bg-stone-600 text-white rounded"
        >
          Search
        </button>
      </div>

      {/* ----- TIMELINE ----- */}
      {voyages.length === 0 ? (
        <p className="text-center">No voyages found.</p>
      ) : (
        <div className="timeline">
          {sortedGroups.map(([header, items]) => (
            <section key={header}>
              <h2 className="text-xl font-semibold mb-3">
                {header === "Non-presidential"
                  ? "Before / After Presidential Use"
                  : `${header} Administration`}
              </h2>

              {items
                .sort(
                  (a, b) =>
                    new Date(a.start_timestamp).getTime() -
                    new Date(b.start_timestamp).getTime()
                )
                .map((v) => (
                  <div key={v.voyage_id} className="timeline-item">
                    <div className="timeline-marker" />
                    <div className="timeline-content">
                      <Link
                        to={`/voyages/${v.voyage_id}`}
                        className="voyage-card"
                      >
                        <h3>
                          {new Date(v.start_timestamp).toLocaleDateString()} –{" "}
                          {new Date(v.end_timestamp).toLocaleDateString()}
                        </h3>
                        <div className="flags">
                          {v.significant === 1 && (
                            <span className="flag significant">
                              Significant
                            </span>
                          )}
                          {v.royalty === 1 && (
                            <span className="flag royalty">Royalty</span>
                          )}
                        </div>
                        <p className="info">{v.additional_info}</p>
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
};

export default VoyageList;
