// Stand-ins, not survey respondents. Every photo is a local 480x600 WebP in public/photos/.
// The two Unsplash ones are self-hosted copies; their credits link back to the photographers.
export interface Photo {
  photo: string;
  /** Caption shown over the photo. */
  credit: string;
  /** Link for the caption. Omitted for our own photos, so the caption is plain text. */
  creditHref?: string;
}

const LACROSSE: Photo = { photo: "/photos/lacrosse-1999.webp", credit: "Game day, May 1 1999" };

const RIVER_CLUB: Photo = { photo: "/photos/river-club-1999.webp", credit: "The River Club, Aug 22 1999" };

const MEN: Photo[] = [
  RIVER_CLUB,
  LACROSSE,
  { photo: "/photos/unsplash-abdullah-ali.webp", credit: "Photo by abdullah ali on Unsplash", creditHref: "https://unsplash.com/@adbullahx" },
  { photo: "/photos/unsplash-arash-khademian.webp", credit: "Photo by Arash Khademian on Unsplash", creditHref: "https://unsplash.com/@arash_khd" },
];

const WOMEN: Photo[] = [
  { photo: "/photos/dorm-2001.webp", credit: "Dorm room, Oct 14 2001" },
  { photo: "/photos/quiktrip-1999.webp", credit: "QuikTrip lot, regular $1.05" },
  { photo: "/photos/enron-1999.webp", credit: "Houston, Oct 27 1999" },
];

/** The photo in the "You've Got Matches!" window, by who you're looking for. */
export const MATCH_PHOTO: Record<"men" | "women", Photo> = {
  men: LACROSSE,
  women: WOMEN[2],
};

/** Which sex a welcome-card slot shows on a given tick. Slots alternate every tick. */
export function checkSex(slot: number, tick: number): "men" | "women" {
  return (slot + tick) % 2 === 0 ? "women" : "men";
}

/** Rotation for the welcome cards: each slot alternates sex every tick and cycles its pool. */
export function checkPhoto(slot: number, tick: number): Photo {
  const pool = checkSex(slot, tick) === "women" ? WOMEN : MEN;
  // Slots 0 and 2 always share a pool on the same tick, so offset by floor(slot / 2) to keep them distinct.
  return pool[(Math.floor(slot / 2) + Math.floor(tick / 2)) % pool.length];
}
