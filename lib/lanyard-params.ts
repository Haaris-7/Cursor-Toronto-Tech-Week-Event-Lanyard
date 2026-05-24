const MAX_FIELD_LENGTH = 32;

export const TRACKS = [
  "Engineer",
  "Designer",
  "Product Manager",
  "Founder",
] as const;

export type Track = (typeof TRACKS)[number];

export interface LanyardFields {
  name: string;
  track: Track | "";
  tagline: string;
}

function sanitize(value: string): string {
  return value.replace(/[\x00-\x1f\x7f]/g, "").trim().slice(0, MAX_FIELD_LENGTH);
}

function parseTrack(raw: string): Track | "" {
  const cleaned = sanitize(raw);
  const match = TRACKS.find(
    (t) => t.toLowerCase() === cleaned.toLowerCase()
  );
  return match ?? "";
}

export function parseParams(
  searchParams: URLSearchParams | Record<string, string | undefined>
): LanyardFields {
  const get = (key: string): string => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? "";
    }
    return searchParams[key] ?? "";
  };

  return {
    name: sanitize(get("n")),
    track: parseTrack(get("r")),
    tagline: sanitize(get("g")),
  };
}

export function serializeParams(fields: LanyardFields): string {
  const params = new URLSearchParams();
  if (fields.name) params.set("n", fields.name);
  if (fields.track) params.set("r", fields.track);
  if (fields.tagline) params.set("g", fields.tagline);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

