import { useState } from "react";

import { defaultLibraryTitle } from "./PromptLibraryShelf.logic";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { stackedThreadToast, toastManager } from "../ui/toast";
import { usePromptLibraryStore } from "../../promptLibraryStore";
import {
  usePromptLibraryUiStore,
  type PromptLibraryEditorSession,
} from "../../promptLibraryUiStore";

function notifyNotDurable(): void {
  toastManager.add(
    stackedThreadToast({
      type: "warning",
      title: "Saved for this session only",
      description: "Browser storage is unavailable, so this prompt will not survive a reload.",
    }),
  );
}

function PromptLibraryEditor(props: {
  readonly session: PromptLibraryEditorSession;
  readonly close: () => void;
}) {
  const { session, close } = props;
  const entries = usePromptLibraryStore((state) => state.entries);
  const addPrompt = usePromptLibraryStore((state) => state.addPrompt);
  const updatePrompt = usePromptLibraryStore((state) => state.updatePrompt);
  const removePrompt = usePromptLibraryStore((state) => state.removePrompt);

  const initial = (() => {
    if (session.kind === "new") {
      return { title: defaultLibraryTitle(session.sourceText), text: session.sourceText };
    }
    const entry = entries.find((candidate) => candidate.id === session.promptId);
    return { title: entry?.title ?? "", text: entry?.text ?? "" };
  })();

  const [title, setTitle] = useState(initial.title);
  const [text, setText] = useState(initial.text);
  const [confirmDelete, setConfirmDelete] = useState(
    session.kind === "edit" && session.confirmDelete,
  );

  const isEditing = session.kind === "edit";
  const canSave = title.trim().length > 0 && text.trim().length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSave) return;
    const result =
      session.kind === "new"
        ? addPrompt({ title, text })
        : updatePrompt(session.promptId, { title, text });
    if (!result.entry) return;
    if (!result.durable) notifyNotDurable();
    close();
  }

  function handleDelete(): void {
    if (session.kind !== "edit") return;
    const result = removePrompt(session.promptId);
    if (result.entry && !result.durable) notifyNotDurable();
    close();
  }

  return (
    <DialogPopup className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit prompt" : "New prompt"}</DialogTitle>
        <DialogDescription>
          Save a prompt you can drop into any thread without retyping it.
        </DialogDescription>
      </DialogHeader>
      <DialogPanel>
        {confirmDelete ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm">Delete “{title}”? This cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Label className="flex flex-col items-stretch gap-1.5">
              Name
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Review for security"
                autoFocus
              />
            </Label>
            <Label className="flex flex-col items-stretch gap-1.5">
              Prompt
              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="What should the agent do?"
                rows={7}
              />
            </Label>
            <DialogFooter>
              {isEditing ? (
                <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSave}>
                Save prompt
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogPanel>
    </DialogPopup>
  );
}

export function PromptLibraryEditorDialog() {
  const session = usePromptLibraryUiStore((state) => state.session);
  const close = usePromptLibraryUiStore((state) => state.close);

  return (
    <Dialog open={session !== null} onOpenChange={(open) => { if (!open) close(); }}>
      {session ? <PromptLibraryEditor key={session.id} session={session} close={close} /> : null}
    </Dialog>
  );
}
