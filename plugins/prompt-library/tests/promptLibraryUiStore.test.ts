import { beforeEach, describe, expect, it } from "vite-plus/test";

import { usePromptLibraryUiStore } from "./promptLibraryUiStore";

describe("promptLibraryUiStore", () => {
  beforeEach(() => usePromptLibraryUiStore.getState().close());

  it("opens a new-prompt session with the composer text as source", () => {
    usePromptLibraryUiStore.getState().openNew("check auth");

    const session = usePromptLibraryUiStore.getState().session;
    expect(session?.kind).toBe("new");
    if (session?.kind === "new") expect(session.sourceText).toBe("check auth");
  });

  it("opens an edit session referencing an existing prompt", () => {
    usePromptLibraryUiStore.getState().openEdit("prompt-1");

    const session = usePromptLibraryUiStore.getState().session;
    expect(session?.kind).toBe("edit");
    if (session?.kind === "edit") expect(session.promptId).toBe("prompt-1");
  });

  it("closes the session", () => {
    usePromptLibraryUiStore.getState().openNew("text");
    usePromptLibraryUiStore.getState().close();

    expect(usePromptLibraryUiStore.getState().session).toBeNull();
  });

  it("gives two sessions with the same input distinct ids", () => {
    usePromptLibraryUiStore.getState().openEdit("prompt-1");
    const first = usePromptLibraryUiStore.getState().session?.id;
    usePromptLibraryUiStore.getState().openEdit("prompt-1");
    const second = usePromptLibraryUiStore.getState().session?.id;

    expect(first).not.toBe(second);
  });
});
