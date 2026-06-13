"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { AlertCircle } from "lucide-react";
import { api } from "~/convex/_generated/api";
import { type Id } from "~/convex/_generated/dataModel";
import { MarkdownRenderer } from "~/components/MarkdownRenderer";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "~/components/ui/resizable";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "~/components/ui/empty";

/** Extract the first # H1 from markdown, fall back to first non-empty line */
function extractTitle(md: string): string {
  for (const line of md.split("\n")) {
    const h1 = /^#\s+(.*)/.exec(line);
    if (h1) return h1[1]!.trim();
    if (line.trim()) return line.trim().slice(0, 80);
  }
  return "Untitled Recipe";
}

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const recipe = useQuery(api.recipes.getById, {
    id: id as Id<"recipes">,
  });
  const updateRecipe = useMutation(api.recipes.update);

  const [markdown, setMarkdown] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  // Pre-fill once the recipe loads
  useEffect(() => {
    if (recipe && !initialized) {
      setMarkdown(recipe.content);
      setInitialized(true);
    }
  }, [recipe, initialized]);

  const title = useMemo(
    () => (markdown.trim() ? extractTitle(markdown) : ""),
    [markdown],
  );

  function handleSave() {
    if (!markdown.trim()) {
      setError("Recipe content cannot be empty.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await updateRecipe({
          id: id as Id<"recipes">,
          title,
          content: markdown,
        });
        router.push(`/recipes/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save changes.");
      }
    });
  }

  if (recipe === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  if (recipe === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Recipe not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Sub-header */}
      <div className="bg-background border-border sticky top-[57px] z-20 border-b">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-6">
          <span className="font-heading text-foreground text-lg">
            {title || "Edit Recipe"}
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/recipes/${id}`)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending || !markdown.trim()}
            >
              {isPending ? "Saving…" : "Save Changes →"}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile: tab switcher */}
      <div className="border-border bg-muted flex border-b md:hidden">
        {(["edit", "preview"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "flex-1 py-2.5 text-xs font-medium tracking-widest uppercase transition-colors",
              tab === t
                ? "text-foreground border-primary bg-background border-b-2"
                : "text-muted-foreground border-b-2 border-transparent",
            ].join(" ")}
          >
            {t === "edit" ? "Write" : "Preview"}
          </button>
        ))}
      </div>

      {/* Desktop: resizable split pane */}
      <ResizablePanelGroup
        orientation="horizontal"
        className="hidden flex-1 md:flex"
      >
        <ResizablePanel defaultSize={50} minSize={25}>
          <div className="flex h-full flex-col">
            <div className="bg-muted border-border flex items-center border-b px-6 py-2">
              <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                Markdown
              </span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              spellCheck={false}
              className="text-foreground placeholder:text-muted-foreground caret-primary bg-background flex-1 resize-none border-none p-8 font-mono text-sm leading-relaxed outline-none"
            />
            {error && (
              <Alert
                variant="destructive"
                className="rounded-none border-x-0 border-b-0"
              >
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50} minSize={25}>
          <div className="h-full overflow-auto">
            {!markdown.trim() ? (
              <Empty className="h-full border-none">
                <EmptyHeader>
                  <EmptyMedia>📝</EmptyMedia>
                  <EmptyTitle>Recipe preview</EmptyTitle>
                  <EmptyDescription>
                    Your changes will appear here as you type.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="p-10">
                <MarkdownRenderer
                  content={markdown}
                  className="prose prose-stone max-w-none"
                />
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Mobile: single-panel view based on active tab */}
      <div className="flex flex-1 flex-col md:hidden">
        {/* Editor */}
        <div
          className={[
            "flex flex-col",
            tab === "preview" ? "hidden" : "flex flex-1",
          ].join(" ")}
        >
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck={false}
            className="text-foreground placeholder:text-muted-foreground caret-primary bg-background min-h-[60vh] flex-1 resize-none border-none p-6 font-mono text-sm leading-relaxed outline-none"
          />
          {error && (
            <Alert
              variant="destructive"
              className="rounded-none border-x-0 border-b-0"
            >
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Preview */}
        <div
          className={[
            tab === "edit" ? "hidden" : "block flex-1 overflow-auto",
          ].join(" ")}
        >
          {!markdown.trim() ? (
            <Empty className="min-h-[60vh] border-none">
              <EmptyHeader>
                <EmptyMedia>📝</EmptyMedia>
                <EmptyTitle>Recipe preview</EmptyTitle>
                <EmptyDescription>
                  Your changes will appear here as you type.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="p-6">
              <MarkdownRenderer
                content={markdown}
                className="prose prose-stone max-w-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
