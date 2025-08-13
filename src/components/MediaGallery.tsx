// File: src/components/MediaGallery.tsx
import React, { useState, useEffect } from "react";
import { api } from "../api";
import { MediaSource } from "../types";

type MediaItem = {
  id: number;
  thumbUrl?: string | null;
  fullUrl?: string | null;
  caption?: string;
  isImage: boolean;
  kind?: string;
};

const looksLikeImage = (s?: string | null) =>
  !!s && /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(s || "");

const toMedia = (raw: MediaSource): MediaItem => {
  const full = raw.source_path;
  const isImg = looksLikeImage(full);
  const captionBits = [
    raw.source_type,
    raw.source_origin ? `— ${raw.source_origin}` : "",
    raw.page_num ? ` (p. ${raw.page_num})` : "",
    raw.source_description ? `: ${raw.source_description}` : "",
  ]
    .join("")
    .trim();

  return {
    id: raw.source_id,
    thumbUrl: isImg ? full : null,
    fullUrl: isImg ? full : undefined,
    caption: captionBits || undefined,
    isImage: isImg,
    kind: raw.source_type,
  };
};

const MediaGallery: React.FC<{ voyageId: number }> = ({ voyageId }) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getVoyageMedia(voyageId)
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setMedia(arr.map(toMedia));
        setLoading(false);
      })
      .catch(() => {
        setMedia([]);
        setLoading(false);
      });
  }, [voyageId]);

  if (loading) return <p className="text-gray-600">Loading media…</p>;
  if (!media.length)
    return <p className="text-gray-600">No media for this voyage.</p>;

  const imageItems = media.filter((m) => m.isImage && m.thumbUrl);
  const otherItems = media.filter((m) => !m.isImage);

  return (
    <div className="space-y-6">
      {imageItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {imageItems.map((m) => (
            <figure
              key={m.id}
              className="rounded overflow-hidden bg-white ring-1 ring-gray-200 shadow-sm"
            >
              <img
                src={m.thumbUrl!}
                alt={m.caption || "Voyage media"}
                loading="lazy"
                decoding="async"
                className="w-full h-40 object-cover"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = "none";
                  const parent = el.parentElement;
                  if (parent) {
                    const ph = document.createElement("div");
                    ph.className =
                      "w-full h-40 flex items-center justify-center bg-gray-100 text-gray-500 text-sm";
                    ph.textContent = "Image unavailable";
                    parent.appendChild(ph);
                  }
                }}
              />
              {m.caption && (
                <figcaption className="p-2 text-xs text-gray-700">
                  {m.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {otherItems.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            Documents & External Media
          </h4>
          <ul className="space-y-2">
            {otherItems.map((m) => (
              <li
                key={m.id}
                className="flex items-start gap-2 p-2 rounded-md bg-white ring-1 ring-gray-200"
              >
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-gray-300">
                  📄
                </span>
                <div className="text-sm">
                  <div className="font-medium">
                    {m.kind || "Item"}{" "}
                    {m.fullUrl ? (
                      <a
                        href={m.fullUrl}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (open)
                      </a>
                    ) : null}
                  </div>
                  {m.caption && (
                    <div className="text-gray-600">{m.caption}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
