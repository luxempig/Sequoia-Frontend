// src/components/VoyageCard.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { api } from "../api";
import { Voyage, MediaSource } from "../types";
import { looksLikeImage, looksLikeVideo } from "../utils/media";

const Badge: React.FC<{
  tone?: "amber" | "violet";
  children: React.ReactNode;
}> = ({ tone = "amber", children }) => (
  <span
    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ring-1
     ${
       tone === "amber"
         ? "bg-amber-100 text-amber-800 ring-amber-200"
         : "bg-violet-100 text-violet-800 ring-violet-200"
     }`}
  >
    {children}
  </span>
);

const fmtRange = (start: string, end?: string | null) => {
  const a = dayjs(start);
  const b = end ? dayjs(end) : null;
  return b && b.isValid() && !a.isSame(b, "day")
    ? `${a.format("MMM D, YYYY")} – ${b.format("MMM D, YYYY")}`
    : a.format("MMM D, YYYY");
};

type Thumb = {
  kind: "image" | "video" | "other";
  url: string; // for image: the image url; for other: the media url to open
  caption?: string;
};

const useFirstMediaWhenVisible = (voyageId: number) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [thumb, setThumb] = useState<Thumb | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ref.current || loaded) return;

    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.some((e) => e.isIntersecting);
        if (!vis) return;
        // visible -> fetch once
        obs.disconnect();
        (async () => {
          try {
            const media = await api.getVoyageMedia(voyageId);
            if (!Array.isArray(media) || media.length === 0) return;

            // Prefer first image; else first video; else first any
            const mkCaption = (m: MediaSource) =>
              [
                m.source_type,
                m.source_origin ? ` — ${m.source_origin}` : "",
                m.page_num ? ` (p. ${m.page_num})` : "",
                m.source_description ? `: ${m.source_description}` : "",
              ]
                .join("")
                .trim();

            const firstImg = media.find((m) => looksLikeImage(m.source_path));
            if (firstImg) {
              setThumb({
                kind: "image",
                url: firstImg.source_path,
                caption: mkCaption(firstImg),
              });
            } else {
              const firstVid = media.find((m) => looksLikeVideo(m.source_path));
              if (firstVid) {
                setThumb({
                  kind: "video",
                  url: firstVid.source_path,
                  caption: mkCaption(firstVid),
                });
              } else {
                const first = media[0];
                if (first?.source_path) {
                  setThumb({
                    kind: "other",
                    url: first.source_path,
                    caption: mkCaption(first),
                  });
                }
              }
            }
          } finally {
            setLoaded(true);
          }
        })();
      },
      { rootMargin: "200px 0px" } // prefetch a bit before entering viewport
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [voyageId, loaded]);

  return { ref, thumb };
};

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
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white text-gray-800 rounded-full w-8 h-8 shadow"
          aria-label="Close"
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

const VoyageCard: React.FC<{ voyage: Voyage }> = ({ voyage }) => {
  const { ref, thumb } = useFirstMediaWhenVisible(voyage.voyage_id);
  const [open, setOpen] = useState(false);

  const significant = voyage.significant === 1 || voyage.significant === true;
  const royalty = voyage.royalty === 1 || voyage.royalty === true;

  return (
    <div ref={ref} className="timeline-item">
      <div className="timeline-content w-full">
        <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-200 hover:shadow-md transition">
          <div className="flex gap-4">
            {/* Left: text block */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <Link
                  to={`/voyages/${voyage.voyage_id}`}
                  className="text-sm sm:text-base font-semibold hover:underline"
                >
                  {fmtRange(voyage.start_timestamp, voyage.end_timestamp)}
                </Link>
                <div className="flex gap-2">
                  {significant && <Badge>Significant</Badge>}
                  {royalty && <Badge tone="violet">Royalty</Badge>}
                </div>
              </div>

              {(voyage.additional_info || voyage.notes) && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {voyage.additional_info || voyage.notes}
                </p>
              )}
            </div>

            {/* Right: media teaser */}
            <div className="w-28 sm:w-36 shrink-0">
              {thumb?.kind === "image" ? (
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="block w-full h-20 sm:h-24 rounded-lg overflow-hidden ring-1 ring-gray-200 hover:ring-gray-300"
                  title={thumb.caption || "Open image"}
                >
                  <img
                    src={thumb.url}
                    alt={thumb.caption || "Voyage media"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                    }}
                  />
                </button>
              ) : thumb?.kind === "video" ? (
                <a
                  href={thumb.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-20 sm:h-24 rounded-lg overflow-hidden ring-1 ring-gray-200 bg-black/80 text-white text-xs
                             flex items-center justify-center hover:ring-gray-300"
                  title={thumb.caption || "Open video"}
                >
                  ▶ Open video
                </a>
              ) : thumb?.kind === "other" ? (
                <a
                  href={thumb.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-20 sm:h-24 rounded-lg overflow-hidden ring-1 ring-gray-200 bg-gray-50 text-gray-700 text-xs
                             flex items-center justify-center hover:ring-gray-300"
                  title={thumb.caption || "Open media"}
                >
                  Open media
                </a>
              ) : (
                <Link
                  to={`/voyages/${voyage.voyage_id}`}
                  className="block w-full h-20 sm:h-24 rounded-lg overflow-hidden ring-1 ring-dashed ring-gray-200 text-gray-500 text-xs
                             flex items-center justify-center hover:ring-gray-300"
                  title="View voyage"
                >
                  View voyage
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {open && thumb?.kind === "image" && (
        <Lightbox
          src={thumb.url}
          alt={thumb.caption}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default VoyageCard;
