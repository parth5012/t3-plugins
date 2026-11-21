import { create } from "zustand";

/**
 * One editor dialog serves both the sidebar shelf and the command palette, so
 * the session lives above both. The id reseeds the dialog when the same prompt
 * is reopened while it is still on screen.
 */
export type PromptLibraryEditorSession =
  | { readonly kind: "new"; readonly id: number; readonly sourceText: string }
  | {
      readonly kind: "edit";
      readonly id: number;
      readonly promptId: string;
      readonly confirmDelete: boolean;
    };

interface PromptLibraryUiStore {
  session: PromptLibraryEditorSession | null;
  openNew: (sourceText: string) => void;
  openEdit: (promptId: string) => void;
  openDelete: (promptId: string) => void;
  close: () => void;
}

let nextSessionId = 0;

export const usePromptLibraryUiStore = create<PromptLibraryUiStore>((set) => ({
  session: null,
  openNew: (sourceText) =>
    set({ session: { kind: "new", id: ++nextSessionId, sourceText } }),
  openEdit: (promptId) =>
    set({ session: { kind: "edit", id: ++nextSessionId, promptId, confirmDelete: false } }),
  openDelete: (promptId) =>
    set({ session: { kind: "edit", id: ++nextSessionId, promptId, confirmDelete: true } }),
  close: () => set({ session: null }),
}));
