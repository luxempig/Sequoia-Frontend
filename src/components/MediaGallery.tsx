import React, { useState, useEffect } from 'react';

interface Media { id: number; thumbnail_url: string; caption: string; }

const MediaGallery: React.FC<{ voyageId: number }> = ({ voyageId }) => {
  const [media, setMedia] = useState<Media[]>([]);

  useEffect(() => {
    fetch(`/api/voyages/${voyageId}/media`)
      .then(res => res.json())
      .then(data => setMedia(data));
  }, [voyageId]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {media.map(m => (
        <div key={m.id} className="rounded overflow-hidden shadow">
          <img src={m.thumbnail_url} alt={m.caption} className="w-full h-32 object-cover" />
          <div className="p-2 text-sm text-gray-700">{m.caption}</div>
        </div>
      ))}
    </div>
  );
};

export default MediaGallery;