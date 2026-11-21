import { useState } from "react";
import * as Schema from "effect/Schema";
import {
  BookOpenIcon,
  ChevronDownIcon,
  PlusIcon,
  SquarePenIcon,
  Trash2Icon,
} from "lucide-react";

import { filterLibraryPrompts, libraryPromptPreview } from "./PromptLibraryShelf.logic";
import { Input } from "../ui/input";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { stackedThreadToast, toastManager } from "../ui/toast";
import { useComposerHandleContext } from "../../composerHandleContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { cn } from "../../lib/utils";
import { usePromptLibraryStore } from "../../promptLibraryStore";
import { usePromptLibraryUiStore } from "../../promptLibraryUiStore";

const EXPANDED_KEY = "t3code:sidebar:prompt-library-expanded";

function notifyNoComposer(): void {
  toastManager.add(
    stackedThreadToast({
      type: "info",
      title: "Open a thread first",
      description: "Prompts are inserted into the composer of the thread you are viewing.",
    }),
  );
}

export function PromptLibraryShelf() {
  const entries = usePromptLibraryStore((state) => state.entries);
  const openNew = usePromptLibraryUiStore((state) => state.openNew);
  const openEdit = usePromptLibraryUiStore((state) => state.openEdit);
  const openDelete = usePromptLibraryUiStore((state) => state.openDelete);
  const composerHandle = useComposerHandleContext();
  const [expanded, setExpanded] = useLocalStorage(EXPANDED_KEY, false, Schema.Boolean);
  const [query, setQuery] = useState("");
  const visibleEntries = filterLibraryPrompts(entries, query);

  function handleInsert(text: string): void {
    const composer = composerHandle?.current;
    if (!composer) {
      notifyNoComposer();
      return;
    }
    if (!composer.insertTextAtEnd(text, { ensureLeadingBoundary: true })) {
      toastManager.add(
        stackedThreadToast({
          type: "error",
          title: "Couldn't insert prompt",
          description: "The composer is busy. Try again in a moment.",
        }),
      );
      return;
    }
    composer.focusAtEnd();
  }

  function handleAdd(): void {
    const sourceText = composerHandle?.current?.readSnapshot().value ?? "";
    openNew(sourceText);
  }

  return (
    <div className="mb-1">
      <div className="flex items-center gap-1 px-1">
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`Prompt Library, ${entries.length} saved`}
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronDownIcon
            aria-hidden
            className={cn("size-3 shrink-0 transition-transform", !expanded && "-rotate-90")}
          />
          <BookOpenIcon aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">Prompt Library</span>
          <span className="text-sidebar-muted-foreground">({entries.length})</span>
        </button>
        <button
          type="button"
          aria-label="Save current prompt to library"
          onClick={handleAdd}
          className="rounded-md p-1 text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <PlusIcon aria-hidden className="size-3.5" />
        </button>
      </div>

      {expanded ? (
        <div className="mt-1 flex flex-col gap-1">
          {entries.length > 0 ? (
            <Input
              aria-label="Search saved prompts"
              className="h-7 text-xs"
              placeholder="Search prompts…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          ) : null}
          {visibleEntries.length > 0 ? (
            <ul role="list" className="flex flex-col gap-px">
              {visibleEntries.map((entry) => (
                <li key={entry.id} className="group flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          onClick={() => handleInsert(entry.text)}
                          className="flex min-w-0 flex-1 flex-col items-start rounded-md px-2 py-1 text-left hover:bg-sidebar-accent"
                        >
                          <span className="w-full truncate text-xs text-sidebar-foreground">
                            {entry.title}
                          </span>
                          <span className="w-full truncate text-[11px] text-sidebar-muted-foreground">
                            {libraryPromptPreview(entry.text)}
                          </span>
                        </button>
                      }
                    />
                    <TooltipPopup side="top">{entry.text}</TooltipPopup>
                  </Tooltip>
                  <button
                    type="button"
                    aria-label={`Edit prompt ${entry.title}`}
                    onClick={() => openEdit(entry.id)}
                    className="hidden rounded p-1 text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground group-hover:block"
                  >
                    <SquarePenIcon aria-hidden className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete prompt ${entry.title}`}
                    onClick={() => openDelete(entry.id)}
                    className="hidden rounded p-1 text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-destructive group-hover:block"
                  >
                    <Trash2Icon aria-hidden className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : entries.length === 0 ? (
            <p className="px-2 py-1 text-[11px] text-sidebar-muted-foreground">
              No prompts yet. Use ＋ to save the current prompt.
            </p>
          ) : (
            <p className="px-2 py-1 text-[11px] text-sidebar-muted-foreground">
              No prompts match “{query}”.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
