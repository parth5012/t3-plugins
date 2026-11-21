import * as Schema from "effect/Schema";
import { create } from "zustand";

import { createMemoryStorage, type StateStorage } from "./lib/storage";

export const PROMPT_LIBRARY_STORAGE_KEY = "t3code:prompt-library:v1";
const PROMPT_LIBRARY_STORAGE_VERSION = 1;

const LibraryPromptSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  text: Schema.String,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export type LibraryPrompt = typeof LibraryPromptSchema.Type;

const PersistedLibraryState = Schema.Struct({
  entries: Schema.Array(LibraryPromptSchema),
});

const decodePersistedLibraryState = Schema.decodeUnknownSync(PersistedLibraryState);

/** Reading the property itself throws when storage is blocked by policy. */
function resolveBaseStorage(): { storage: StateStorage; durable: boolean } {
  try {
    if (typeof localStorage !== "undefined") {
      return { storage: localStorage, durable: true };
    }
  } catch {
    // Fall through to the in-memory store.
  }
  return { storage: createMemoryStorage(), durable: false };
}

const { storage: baseLibraryStorage, durable: storageIsDurable } = resolveBaseStorage();

/** Returns `durable: false` when the write will not survive a reload. */
function persistEntries(entries: ReadonlyArray<LibraryPrompt>): { written: boolean; durable: boolean } {
  try {
    baseLibraryStorage.setItem(
      PROMPT_LIBRARY_STORAGE_KEY,
      JSON.stringify({
        version: PROMPT_LIBRARY_STORAGE_VERSION,
        state: { entries },
      }),
    );
    return { written: true, durable: storageIsDurable };
  } catch (error) {
    console.error("[PROMPT-LIBRARY] Could not persist library (storage quota?).", error);
    return { written: false, durable: false };
  }
}

function readPersistedEntries(): ReadonlyArray<LibraryPrompt> | null {
  try {
    const raw = baseLibraryStorage.getItem(PROMPT_LIBRARY_STORAGE_KEY);
    if (typeof raw !== "string" || raw.length === 0) return null;
    const parsed: unknown = JSON.parse(raw);
    const state = (parsed as { state?: unknown } | null)?.state;
    if (!state) return null;
    return decodePersistedLibraryState(state).entries;
  } catch {
    return null;
  }
}

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface PromptLibraryStoreState {
  entries: ReadonlyArray<LibraryPrompt>;
  addPrompt: (input: {
    title: string;
    text: string;
  }) => { entry: LibraryPrompt | null; durable: boolean };
  updatePrompt: (
    id: string,
    input: { title: string; text: string },
  ) => { entry: LibraryPrompt | null; durable: boolean };
  removePrompt: (id: string) => { entry: LibraryPrompt | null; durable: boolean };
}

export const usePromptLibraryStore = create<PromptLibraryStoreState>()((set, get) => ({
  entries: [],
  addPrompt: (input) => {
    const title = input.title.trim();
    const text = input.text.trim();
    if (!title || !text) return { entry: null, durable: true };

    const now = new Date().toISOString();
    const entry: LibraryPrompt = {
      id: makeId(),
      title,
      text,
      createdAt: now,
      updatedAt: now,
    };
    const entries = [...get().entries, entry];
    const { durable } = persistEntries(entries);
    set(() => ({ entries }));
    return { entry, durable };
  },
  updatePrompt: (id, input) => {
    const existing = get().entries.find((candidate) => candidate.id === id);
    const title = input.title.trim();
    const text = input.text.trim();
    if (!existing || !title || !text) return { entry: null, durable: true };

    const entry: LibraryPrompt = {
      ...existing,
      title,
      text,
      updatedAt: new Date().toISOString(),
    };
    const entries = get().entries.map((candidate) => (candidate.id === id ? entry : candidate));
    const { durable } = persistEntries(entries);
    set(() => ({ entries }));
    return { entry, durable };
  },
  removePrompt: (id) => {
    const entry = get().entries.find((candidate) => candidate.id === id) ?? null;
    if (!entry) return { entry: null, durable: true };

    const entries = get().entries.filter((candidate) => candidate.id !== id);
    const { durable } = persistEntries(entries);
    set(() => ({ entries }));
    return { entry, durable };
  },
}));

{
  const persisted = readPersistedEntries();
  if (persisted) {
    usePromptLibraryStore.setState({ entries: persisted });
  }
}

/** Test seams: seed/read the persisted payload through the same storage the store uses. */
export function writePromptLibraryStorageForTest(raw: string): void {
  baseLibraryStorage.setItem(PROMPT_LIBRARY_STORAGE_KEY, raw);
  usePromptLibraryStore.setState({ entries: readPersistedEntries() ?? [] });
}

export function readPromptLibraryStorageForTest(): string {
  const raw = baseLibraryStorage.getItem(PROMPT_LIBRARY_STORAGE_KEY);
  return typeof raw === "string" ? raw : "";
}
