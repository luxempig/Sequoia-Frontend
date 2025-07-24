import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TimelineChart from './TimelineChart';

const Sidebar: React.FC = () => {
  const [presidents, setPresidents] = useState<string[]>([]);
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const selected = params.get('president') || '';

  useEffect(() => {
    fetch('/api/presidents')
      .then(res => res.json())
      .then(data => setPresidents(data));
  }, []);

  const onSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const qp = new URLSearchParams(search);
    if (val) qp.set('president', val);
    else qp.delete('president');
    navigate({ pathname: '/', search: qp.toString() });
  };

  return (
    <aside className="w-64 bg-white border-r p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Filters</h2>
      <select
        className="mb-6 p-2 border rounded"
        value={selected}
        onChange={onSelect}
      >
        <option value="">All Presidents</option>
        {presidents.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <div className="flex-1">
        <TimelineChart president={selected} />
      </div>
    </aside>
  );
};

export default Sidebar;