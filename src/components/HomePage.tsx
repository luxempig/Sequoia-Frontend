// src/components/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Voyage {
  voyage_id: number;
  start_timestamp: string;
  end_timestamp: string;
  additional_info: string;
  notes: string;
  significant: number;
  royalty: number;
}

export default function HomePage() {
  const [inputValue, setInputValue]   = useState('');
  const [searchTerm, setSearchTerm]   = useState('');
  const [significant, setSignificant] = useState(false);
  const [royalty, setRoyalty]         = useState(false);
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [voyages, setVoyages]         = useState<Voyage[]>([]);
  const [loading, setLoading]         = useState(false);

  const handleSearch = () => setSearchTerm(inputValue);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm)   params.set('q', searchTerm);
    if (significant)  params.set('significant', '1');
    if (royalty)      params.set('royalty', '1');
    if (dateFrom)     params.set('date_from', dateFrom);
    if (dateTo)       params.set('date_to', dateTo);

    fetch(`/api/voyages?${params.toString()}`)
      .then(r => r.json())
      .then((data: Voyage[]) => setVoyages(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchTerm, significant, royalty, dateFrom, dateTo]);

  return (
    <div className="min-h-screen bg-oak flex flex-col text-white">
      {/* Hero / Filters */}
      <section className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-6xl font-extrabold mb-4">Sequoia Voyages</h1>
        <p className="text-lg mb-8">
          Welcome aboard.
        </p>

        <div className="w-full max-w-2xl bg-stone-300 bg-opacity-90 rounded-lg shadow p-6 flex flex-col space-y-4">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search voyages..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              className="flex-grow p-3 bg-stone-100 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-oak"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-stone-600 text-white rounded-lg font-medium hover:opacity-90"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={significant}
                onChange={e => setSignificant(e.target.checked)}
              />
              <span>Significant only</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={royalty}
                onChange={e => setRoyalty(e.target.checked)}
              />
              <span>Royalty onboard</span>
            </label>

            <label className="flex items-center space-x-2">
              <span>From:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="p-1 bg-stone-100 text-gray-800 border border-gray-300 rounded"
              />
            </label>

            <label className="flex items-center space-x-2">
              <span>To:</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="p-1 bg-stone-100 text-gray-800 border border-gray-300 rounded"
              />
            </label>
          </div>

          <a href="#about" className="mt-4 inline-block font-medium hover:underline">
            Learn more ↓
          </a>
        </div>
      </section>

      {/* About Section (white background) */}
      <section id="about" className="bg-white py-16 px-8 text-gray-900">
        <h2 className="text-4xl font-semibold mb-4">About</h2>
        <p className="max-w-3xl leading-relaxed">
          This project showcases an interactive archive of presidential voyages aboard the USS Sequoia.
          Filter by president, date, or keyword to explore detailed itineraries, passenger lists, and historical media.
        </p>
      </section>

      {/* Timeline Results (white background) */}
      <section className="bg-white py-8 px-4 text-gray-900">
        {loading ? (
          <p className="text-center">Loading voyages…</p>
        ) : voyages.length === 0 ? (
          <p className="text-center">No voyages found.</p>
        ) : (
          <ul className="timeline">
            {voyages
              .sort((a, b) =>
                new Date(a.start_timestamp).getTime() -
                new Date(b.start_timestamp).getTime()
              )
              .map(v => (
                <li key={v.voyage_id} className="timeline-item">
                  <div className="timeline-marker" />
                  <div className="timeline-content">
                    <Link to={`/voyages/${v.voyage_id}`} className="voyage-card">
                      <h3>
                        {new Date(v.start_timestamp).toLocaleDateString()} –{' '}
                        {new Date(v.end_timestamp).toLocaleDateString()}
                      </h3>
                      <div className="flags">
                        {v.significant === 1 && (
                          <span className="flag significant">Significant</span>
                        )}
                        {v.royalty === 1 && (
                          <span className="flag royalty">Royalty</span>
                        )}
                      </div>
                      <p className="info">{v.additional_info}</p>
                    </Link>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
