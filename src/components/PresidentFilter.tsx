import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

interface President {
  president_id: number;
  full_name: string;
  term_start: string;
  term_end: string;
}

/**
 * Dropdown tied to the URL `president_id` query-param.
 * Fetches its options from GET /api/presidents.
 */
const PresidentFilter: React.FC = () => {
  const [presidents, setPresidents] = useState<President[]>([]);
  const [params, setParams] = useSearchParams();
  const active = params.get("president_id") ?? "";

  // load once
  useEffect(() => {
    fetch("/api/presidents")
      .then((r) => r.json())import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

interface President {
  president_id: number;
  full_name: string;
  term_start: string;
  term_end: string;
}

/**
 * Dropdown tied to the URL `president_id` query-param.
 * Fetches its options from GET /api/presidents.
 */
const PresidentFilter: React.FC = () => {
  const [presidents, setPresidents] = useState<President[]>([]);
  const [params, setParams] = useSearchParams();
  const active = params.get("president_id") ?? "";

  // load once
  useEffect(() => {
    fetch("/api/presidents")
      .then((r) => r.json())
      .then(setPresidents)
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(params);
    e.target.value ? next.set("president_id", e.target.value) : next.delete("president_id");
    setParams(next);
  };

  return (
    <select
      value={active}
      onChange={handleChange}
      className="px-3 py-2 border rounded bg-white text-gray-800"
    >
      <option value="">All administrations</option>
      {presidents.map((p) => (
        <option key={p.president_id} value={p.president_id}>
          {p.full_name}
        </option>
      ))}
    </select>
  );
};

export default PresidentFilter;

      .then(setPresidents)
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams
