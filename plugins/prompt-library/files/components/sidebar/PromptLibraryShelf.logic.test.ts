import { describe, expect, it } from "vite-plus/test";

import {
  defaultLibraryTitle,
  filterLibraryPrompts,
  libraryPromptPreview,
} from "./PromptLibraryShelf.logic";

describe("defaultLibraryTitle", () => {
  it("uses the first non-empty line of the prompt", () => {
    expect(defaultLibraryTitle("\n\n  Review this diff for auth issues\nmore details")).toBe(
      "Review this diff for auth issues",
    );
  });

  it("caps the title at 60 characters", () => {
    const longLine = "x".repeat(120);
    expect(defaultLibraryTitle(longLine)).toHaveLength(60);
  });

  it("falls back for an empty prompt", () => {
    expect(defaultLibraryTitle("   \n  ")).toBe("Untitled prompt");
  });
});

describe("filterLibraryPrompts", () => {
  const entries = [
    { id: "1", title: "Review for security", text: "check auth" },
    { id: "2", title: "Write tests for parser", text: "cover cases" },
    { id: "3", title: "Summarize this PR", text: "short summary" },
  ];

  it("returns every entry for an empty query", () => {
    expect(filterLibraryPrompts(entries, "")).toEqual(entries);
  });

  it("matches title case-insensitively across words", () => {
    expect(filterLibraryPrompts(entries, "review SECURITY")).toEqual([entries[0]]);
  });

  it("returns nothing when no title matches", () => {
    expect(filterLibraryPrompts(entries, "deploy")).toEqual([]);
  });
});

describe("libraryPromptPreview", () => {
  it("collapses newlines into a single line", () => {
    expect(libraryPromptPreview("first line\nsecond line")).toBe("first line second line");
  });

  it("truncates long text and adds an ellipsis", () => {
    const result = libraryPromptPreview("x".repeat(120), 10);
    expect(result).toHaveLength(11);
    expect(result.endsWith("…")).toBe(true);
  });
});
