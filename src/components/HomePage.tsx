// src/components/HomePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    navigate(`/voyages?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-oak flex flex-col text-white">
      {/* Full-screen Hero */}
      <section className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-6xl font-extrabold mb-4">Sequoia Voyages</h1>
        <p className="text-lg mb-8">Your gateway to presidential journeys</p>

        {/* Search & Timeline Button */}
        <div className="w-full max-w-xl bg-stone-300 bg-opacity-90 rounded-lg shadow p-6 flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Search voyages..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="p-3 bg-stone-100 text-gray-800 border border-gray-300 rounded-lg focus:outline-none"
          />

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-stone-600 text-white rounded-lg font-medium hover:opacity-90"
            >
              Search
            </button>
            <button
              onClick={() => navigate('/voyages')}
              className="px-6 py-3 bg-stone-500 text-white rounded-lg font-medium hover:opacity-90"
            >
              View full voyage timeline
            </button>
          </div>
        </div>

        {/* Scroll to About */}
        <button
          onClick={() => {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="mt-8 text-white font-medium hover:underline"
        >
          Learn more ↓
        </button>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-16 px-8 text-gray-900">
        <h2 className="text-4xl font-semibold mb-4">About</h2>
        <p className="max-w-3xl leading-relaxed">
          This project showcases an interactive archive of presidential voyages aboard the USS Sequoia.
          Filter by president, date, or keyword to explore detailed itineraries, passenger lists, and historical media.
        </p>
      </section>
    </div>
  );
}