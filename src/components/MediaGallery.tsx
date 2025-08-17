// File: src/components/MediaGallery.tsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { MediaSource } from "../types";
import { looksLikeImage } from "../utils/media";

/** Build a nice caption line from a MediaSource row */
function captionOf(m: MediaSource): string | undefined {
  const parts = [
    m.source_type,
    m.source_origin ? ` — ${m.source_origin}` : "",
    m.page_num ? ` (p. ${m.page_num})` : "",
    m.source_description ? `: ${m.source_description}` : "",
  ];
  const s = parts.join("").trim();
  return s || undefined;
}

/** Lightweight image lightbox */
const Lightbox: React.FC<{
  src: string;
  alt?: string;
  onClose: () => void;
}> = ({ src, alt, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white text-gray-800 rounded-full w-8 h-8 shadow"
          aria-label="Close image viewer"
        >
          ✕
        </button>
        <img
          src={src}
          alt={alt || "Media"}
          className="w-full max-h-[85vh] object-contain rounded-lg bg-white"
        />
      </div>
    </div>
  );
};

type GalleryItem = {
  id: number;
  url: string;
  caption?: string;
  isImage: boolean;
  page?: number | null;
};

const MediaGallery: React.FC<{ voyageId: number }> = ({ voyageId }) => {
  const [raw, setRaw] = useState<MediaSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [broken, setBroken] = useState<Set<number>>(new Set());
  const [lightbox, setLightbox] = useState<{ src: string; alt?: string } | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setBroken(new Set());
    setLightbox(null);

    api
      .getVoyageMedia(voyageId)
      .then((rows) => {
        if (!alive) return;
        setRaw(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!alive) return;
        setRaw([]);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [voyageId]);

  const items: GalleryItem[] = useMemo(() => {
    return raw
      .map((m) => ({
        id: m.source_id,
        url: m.source_path,
        caption: captionOf(m),
        isImage: looksLikeImage(m.source_path),
        page: m.page_num ?? null,
      }))
      // Put page-numbered items in reading order; otherwise stable
      .sort((a, b) => (a.page ?? 1e9) - (b.page ?? 1e9));
  }, [raw]);

  if (loading) return <p className="text-gray-600">Loading media…</p>;
  if (items.length === 0) return <p className="text-gray-600">No media for this voyage.</p>;

  return (
    <div className="space-y-6">
      {/* IMAGE GRID — each image falls back to a plain link if it fails to load */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it) => {
          const failed = broken.has(it.id);
          // If it *should* be an image and hasn't failed, try to show it
          if (it.isImage && !failed) {
            return (
              <figure
                key={it.id}
                className="rounded overflow-hidden bg-white ring-1 ring-gray-200 shadow-sm"
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img
                  src={it.url}
                  alt={it.caption || "Voyage media"}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-40 object-cover"
                  onClick={() => setLightbox({ src: it.url, alt: it.caption })}
                  onError={() =>
                    setBroken((prev) => new Set(prev).add(it.id))
                  }
                  style={{ cursor: "zoom-in" }}
                />
                <figcaption className="p-2 text-xs text-gray-700">
                  {it.caption}
                  {" "}
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    (open)
                  </a>
                </figcaption>
              </figure>
            );
          }

          // Otherwise: show a neat "open media" card (works for docs, videos, or failed images)
          return (
            <a
              key={it.id}
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-3 rounded-md bg-white ring-1 ring-gray-200 hover:ring-gray-300 transition"
              title={it.caption || "Open media"}
            >
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-gray-300">
                📄
              </span>
              <div className="text-xs">
                <div className="font-medium text-gray-900">Open media</div>
                {it.caption && <div className="text-gray-600">{it.caption}</div>}
              </div>
            </a>
          );
        })}
      </div>

      {lightbox && (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
};

export default MediaGallery;
