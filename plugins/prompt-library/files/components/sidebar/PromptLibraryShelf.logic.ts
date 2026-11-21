/** Shared pure helpers for the sidebar shelf and the command palette group. */

export function defaultLibraryTitle(text: string): string {
  const firstLine = text
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  return firstLine ? firstLine.slice(0, 60) : "Untitled prompt";
}

export function filterLibraryPrompts<T extends { title: string }>(
  entries: ReadonlyArray<T>,
  query: string,
): T[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [...entries];

  return entries.filter((entry) => {
    const haystack = entry.title.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}

export function libraryPromptPreview(text: string, maxLength = 80): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  if (singleLine.length <= maxLength) return singleLine;
  return `${singleLine.slice(0, maxLength)}…`;
}
