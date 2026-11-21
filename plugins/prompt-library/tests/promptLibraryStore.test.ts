import { beforeEach, afterEach, describe, expect, it } from "vite-plus/test";

import { removeLocalStorageItem } from "./hooks/useLocalStorage";
import {
  PROMPT_LIBRARY_STORAGE_KEY,
  readPromptLibraryStorageForTest,
  usePromptLibraryStore,
  writePromptLibraryStorageForTest,
} from "./promptLibraryStore";

function resetStore(): void {
  usePromptLibraryStore.setState({ entries: [] });
  writePromptLibraryStorageForTest("");
  removeLocalStorageItem(PROMPT_LIBRARY_STORAGE_KEY);
}

describe("promptLibraryStore", () => {
  beforeEach(resetStore);
  afterEach(resetStore);

  it("adds a trimmed prompt and exposes it in the library", () => {
    const result = usePromptLibraryStore.getState().addPrompt({
      title: "  Review for security  ",
      text: "  Check auth and input handling  ",
    });

    expect(result.entry).not.toBeNull();
    expect(result.entry?.title).toBe("Review for security");
    expect(result.entry?.text).toBe("Check auth and input handling");
    expect(result.entry?.id).toEqual(expect.any(String));
    expect(result.entry?.createdAt).toEqual(expect.any(String));
    expect(result.entry?.updatedAt).toBe(result.entry?.createdAt);
    expect(usePromptLibraryStore.getState().entries).toHaveLength(1);
  });

  it("refuses a prompt with an empty title or body", () => {
    const emptyTitle = usePromptLibraryStore
      .getState()
      .addPrompt({ title: "   ", text: "valid body" });
    const emptyText = usePromptLibraryStore
      .getState()
      .addPrompt({ title: "valid title", text: "   " });

    expect(emptyTitle.entry).toBeNull();
    expect(emptyText.entry).toBeNull();
    expect(usePromptLibraryStore.getState().entries).toHaveLength(0);
  });

  it("survives a reload through the persisted payload", () => {
    const { entry } = usePromptLibraryStore
      .getState()
      .addPrompt({ title: "Write tests", text: "Cover the happy path" });
    expect(entry).not.toBeNull();

    const raw = readPromptLibraryStorageForTest();
    expect(raw).toBeTruthy();
    usePromptLibraryStore.setState({ entries: [] });
    writePromptLibraryStorageForTest(raw);

    expect(usePromptLibraryStore.getState().entries).toEqual([entry]);
  });

  it("updates a prompt without changing its id or creation time", () => {
    const { entry: original } = usePromptLibraryStore
      .getState()
      .addPrompt({ title: "Old title", text: "Old body" });
    expect(original).not.toBeNull();
    if (!original) return;

    const result = usePromptLibraryStore
      .getState()
      .updatePrompt(original.id, { title: "New title", text: "New body" });

    expect(result.entry?.id).toBe(original.id);
    expect(result.entry?.createdAt).toBe(original.createdAt);
    expect(result.entry?.title).toBe("New title");
    expect(result.entry?.text).toBe("New body");
    expect(usePromptLibraryStore.getState().entries[0]?.title).toBe("New title");
  });

  it("removes a prompt and leaves the rest untouched", () => {
    const first = usePromptLibraryStore
      .getState()
      .addPrompt({ title: "First", text: "One" }).entry;
    const second = usePromptLibraryStore
      .getState()
      .addPrompt({ title: "Second", text: "Two" }).entry;
    expect(first && second).toBeTruthy();
    if (!first || !second) return;

    const result = usePromptLibraryStore.getState().removePrompt(first.id);

    expect(result.entry?.id).toBe(first.id);
    expect(usePromptLibraryStore.getState().entries).toEqual([second]);
  });

  it("ignores a persisted payload with malformed entries", () => {
    writePromptLibraryStorageForTest(
      JSON.stringify({ version: 1, state: { entries: [{ title: "no id" }] } }),
    );
    expect(usePromptLibraryStore.getState().entries).toEqual([]);
  });
});
