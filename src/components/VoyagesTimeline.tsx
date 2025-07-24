// src/components/VoyagesTimeline.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

// Define the shape of a voyage
interface Voyage {
  voyage_id: number;
  start_timestamp: string;
  end_timestamp: string;
  significant: number;
  royalty: number;
}

const VoyagesTimeline: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [voyages, setVoyages] = useState<Voyage[]>([]);

  // Helper to update a single URL search param
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  // Fetch voyages whenever the filter params change
  useEffect(() => {
    const params = new URLSearchParams();
    ['significant', 'royalty', 'date_from', 'date_to'].forEach(key => {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    });
    const query = params.toString() ? `?${params.toString()}` : '';

    fetch(`/voyages${query}`)
      .then(res => res.json())
      .then(setVoyages)
      .catch(console.error);
  }, [searchParams]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Voyages Timeline</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={Boolean(searchParams.get('significant'))}
            onChange={e => updateParam('significant', e.target.checked ? '1' : '')}
          />
          <span>Significant only</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={Boolean(searchParams.get('royalty'))}
            onChange={e => updateParam('royalty', e.target.checked ? '1' : '')}
          />
          <span>Royalty onboard</span>
        </label>

        <label className="flex items-center space-x-2">
          <span>From:</span>
          <input
            type="date"
            value={searchParams.get('date_from') || ''}
            onChange={e => updateParam('date_from', e.target.value)}
          />
        </label>

        <label className="flex items-center space-x-2">
          <span>To:</span>
          <input
            type="date"
            value={searchParams.get('date_to') || ''}
            onChange={e => updateParam('date_to', e.target.value)}
          />
        </label>
      </div>

      {/* Timeline Items */}
      <ul>
        {voyages
          .sort(
            (a, b) =>
              new Date(a.start_timestamp).getTime() -
              new Date(b.start_timestamp).getTime()
          )
          .map(v => (
            <li
              key={v.voyage_id}
              className="mb-6 border-l-2 border-gray-300 pl-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">
                    {v.start_timestamp} – {v.end_timestamp}
                  </div>
                  <div className="text-sm text-gray-600">
                    ID: {v.voyage_id}
                  </div>
                </div>
                <Link
                  to={`/voyages/${v.voyage_id}`}
                  className="text-blue-500 hover:underline"
                >
                  View Details
                </Link>
              </div>

              {/* Flags */}
              <div className="mt-2 flex space-x-2">
                {v.significant === 1 && (
                  <span className="px-2 py-1 bg-yellow-200 rounded">
                    Significant Voyage!
                  </span>
                )}
                {v.royalty === 1 && (
                  <span className="px-2 py-1 bg-purple-200 rounded">
                    Royalty Onboard!
                  </span>
                )}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default VoyagesTimeline;