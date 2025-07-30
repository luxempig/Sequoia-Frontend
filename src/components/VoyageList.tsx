// File: src/components/VoyageList.tsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './VoyageList.css';

interface Voyage {
  voyage_id: number;
  start_timestamp: string;
  end_timestamp: string;
  additional_info: string;
  notes: string;
  significant: number;
  royalty: number;
}

const VoyageList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [voyages, setVoyages] = useState<Voyage[]>([]);

  // helper to update filters
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    // include text-search param 'q' along with other filters
    ['significant','royalty','date_from','date_to','q'].forEach(k => {
      const v = searchParams.get(k);
      if (v) params.set(k, v);
    });
    const query = params.toString() ? `?${params.toString()}` : '';

    fetch(`/api/voyages${query}`)
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data: Voyage[]) => setVoyages(data))
      .catch(err => {
        console.error('Error loading voyages:', err);
        setVoyages([]);
      });
  }, [searchParams]);

  return (
    <div className="voyage-list-container">
      <div className="filters">
        <label>
          <input
            type="checkbox"
            checked={Boolean(searchParams.get('significant'))}
            onChange={e => updateParam('significant', e.target.checked ? '1' : '')}
          /> Significant only
        </label>
        <label>
          <input
            type="checkbox"
            checked={Boolean(searchParams.get('royalty'))}
            onChange={e => updateParam('royalty', e.target.checked ? '1' : '')}
          /> Royalty onboard
        </label>
        <label>
          From: <input
            type="date"
            value={searchParams.get('date_from')||''}
            onChange={e=> updateParam('date_from', e.target.value)}
          />
        </label>
        <label>
          To: <input
            type="date"
            value={searchParams.get('date_to')||''}
            onChange={e=> updateParam('date_to', e.target.value)}
          />
        </label>
        <label>
          Search: <input
            type="text"
            value={searchParams.get('q')||''}
            onChange={e=> updateParam('q', e.target.value)}
            placeholder="Keyword"
          />
        </label>
      </div>

      <div className="timeline">
        {voyages.length === 0 ? (
          <p className="text-center">No voyages found.</p>
        ) : (
          voyages
            .sort((a,b)=> new Date(a.start_timestamp).getTime() - new Date(b.start_timestamp).getTime())
            .map(v => (
              <div key={v.voyage_id} className="timeline-item">
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <Link to={`/voyages/${v.voyage_id}`} className="voyage-card">
                    <h3>{new Date(v.start_timestamp).toLocaleDateString()} – {new Date(v.end_timestamp).toLocaleDateString()}</h3>
                    <div className="flags">
                      {v.significant===1 && <span className="flag significant">Significant</span>}
                      {v.royalty===1     && <span className="flag royalty">Royalty</span>}
                    </div>
                    <p className="info">{v.additional_info}</p>
                  </Link>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default VoyageList;
