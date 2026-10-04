"use client";

import { useState, useMemo, Fragment } from "react";
import { useForm } from "@tanstack/react-form";
import { useSelector } from "@tanstack/react-store";
import { AlertCircle, Eye, Pencil, Save } from "lucide-react";
import { type Id } from "~/convex/_generated/dataModel";
import { MarkdownRenderer } from "~/components/MarkdownRenderer";
import { ImageUpload } from "~/components/ImageUpload";
import { TagSelect } from "~/components/TagSelect";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { useOnline } from "~/hooks/use-online";

export type RecipeDifficulty = "easy" | "medium" | "hard";

export interface RecipeEditorSaveData {
  title: string;
  markdown: string;
  imageId: Id<"_storage"> | null;
  tags: string[];
  difficulty?: RecipeDifficulty;
  totalTime?: number;
  cuisine?: string;
}

interface InitialRecipe {
  markdown: string;
  imageId?: Id<"_storage"> | null;
  imageUrl?: string | null;
  tags?: string[];
  difficulty?: RecipeDifficulty;
  totalTime?: number;
  cuisine?: string;
}

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface RecipeEditorProps {
  initialRecipe?: InitialRecipe;
  /** Fallback header text when markdown has no title yet */
  headerTitle: string;
  saveLabel: string;
  error: string | null;
  onSave: (data: RecipeEditorSaveData) => Promise<void>;
  breadcrumbs?: BreadcrumbEntry[];
}

function extractTitle(md: string): string {
  for (const line of md.split("\n")) {
    const h1 = /^#\s+(.*)/.exec(line);
    if (h1) return h1[1]!.trim();
    if (line.trim()) return line.trim().slice(0, 80);
  }
  return "Untitled Recipe";
}

function toDifficulty(v: string): RecipeDifficulty | undefined {
  return v === "easy" || v === "medium" || v === "hard" ? v : undefined;
}

export function RecipeEditor({
  initialRecipe,
  headerTitle,
  saveLabel,
  error,
  onSave,
  breadcrumbs,
}: RecipeEditorProps) {
  const online = useOnline();
  const {
    markdown: initialMarkdown = "",
    imageId: initialImageId = null,
    imageUrl: initialImageUrl = null,
    tags: initialTags = [],
    difficulty: initialDifficulty,
    totalTime: initialTotalTime,
    cuisine: initialCuisine = "",
  } = initialRecipe ?? {};
  const form = useForm({
    defaultValues: {
      markdown: initialMarkdown,
      imageId: initialImageId,
      tags: initialTags,
      difficulty: initialDifficulty ?? "",
      totalTime: initialTotalTime,
      cuisine: initialCuisine,
    },
    onSubmit: async ({ value }) => {
      if (!navigator.onLine) return;
      await onSave({
        title: extractTitle(value.markdown),
        markdown: value.markdown,
        imageId: value.imageId,
        tags: value.tags,
        difficulty: toDifficulty(value.difficulty),
        totalTime: value.totalTime ?? undefined,
        cuisine: value.cuisine ?? undefined,
      });
    },
  });

  const markdown = useSelector(form.store, (s) => s.values.markdown);
  const tags = useSelector(form.store, (s) => s.values.tags);
  const difficulty = useSelector(form.store, (s) => s.values.difficulty);
  const totalTime = useSelector(form.store, (s) => s.values.totalTime);
  const cuisine = useSelector(form.store, (s) => s.values.cuisine);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const title = useMemo(
    () => (markdown.trim() ? extractTitle(markdown) : ""),
    [markdown],
  );

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Breadcrumb bar */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="border-border border-b px-6 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <Fragment key={crumb.label}>
                    {i > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {isLast || !crumb.href ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
      {/* Sub-header */}
      <div className="bg-background sticky top-[57px] z-20 border-t border-b border-black/8">
        <div className="mx-auto flex min-h-14 max-w-screen-xl items-center justify-between gap-4 px-6 py-3">
          <span className="font-heading text-foreground min-w-0 truncate text-lg">
            {title || headerTitle}
          </span>
          <div className="flex items-center gap-2">
            {/* Mobile: icon-only toggle */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setTab(tab === "edit" ? "preview" : "edit")}
              aria-label={tab === "preview" ? "Edit" : "Preview"}
            >
              {tab === "preview" ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            {/* Mobile: icon-only save */}
            <Button
              onClick={() => void form.handleSubmit()}
              disabled={!online || form.state.isSubmitting || !markdown.trim()}
              size="sm"
              className="md:hidden"
              aria-label={saveLabel}
            >
              <Save className="h-4 w-4" />
            </Button>
            {/* Desktop: full save button */}
            <Button
              onClick={() => void form.handleSubmit()}
              disabled={!online || form.state.isSubmitting || !markdown.trim()}
              size="sm"
              className="hidden md:inline-flex"
            >
              {form.state.isSubmitting ? "Saving…" : saveLabel}
            </Button>
          </div>
        </div>
      </div>

      <ImageUpload
        currentImageUrl={initialImageUrl ?? undefined}
        onUpload={(newId) => form.setFieldValue("imageId", newId)}
      />

      <TagSelect value={tags} onChange={(v) => form.setFieldValue("tags", v)} />

      {/* Details: difficulty, total time, cuisine */}
      <div className="border-border border-b px-6 py-4">
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
          Details
        </p>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          {/* Difficulty */}
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs font-medium">
              Difficulty
            </Label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={difficulty}
              onValueChange={(v) => form.setFieldValue("difficulty", v)}
            >
              <ToggleGroupItem value="easy">Easy</ToggleGroupItem>
              <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
              <ToggleGroupItem value="hard">Hard</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Total Time */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="recipe-total-time"
              className="text-muted-foreground text-xs font-medium"
            >
              Total Time (min)
            </Label>
            <Input
              id="recipe-total-time"
              type="number"
              min={1}
              placeholder="e.g. 30"
              className="w-28"
              value={totalTime ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                form.setFieldValue(
                  "totalTime",
                  val ? parseInt(val, 10) : undefined,
                );
              }}
            />
          </div>

          {/* Cuisine */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="recipe-cuisine"
              className="text-muted-foreground text-xs font-medium"
            >
              Cuisine
            </Label>
            <Input
              id="recipe-cuisine"
              type="text"
              placeholder="e.g. Italian"
              className="w-36"
              value={cuisine ?? ""}
              onChange={(e) => form.setFieldValue("cuisine", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Desktop: resizable split pane */}
      <div className="hidden flex-1 md:flex">
        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          <ResizablePanel defaultSize={50} minSize={25}>
            <div className="flex h-full flex-col">
              <div className="bg-muted border-border flex items-center border-b px-6 py-2">
                <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                  Markdown
                </span>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => form.setFieldValue("markdown", e.target.value)}
                placeholder={
                  "Paste your recipe in markdown...\n\n# Recipe Title\n\n## Ingredients\n- item\n\n## Method\n1. Step one"
                }
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
                      Paste any markdown on the left — any format works.
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
      </div>

      {/* Mobile: single-panel view */}
      <div className="flex flex-1 flex-col md:hidden">
        <div
          className={[
            "flex flex-col",
            tab === "preview" ? "hidden" : "flex flex-1",
          ].join(" ")}
        >
          <textarea
            value={markdown}
            onChange={(e) => form.setFieldValue("markdown", e.target.value)}
            placeholder={
              "Paste your recipe in markdown...\n\n# Recipe Title\n\n## Ingredients\n- item\n\n## Method\n1. Step one"
            }
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
                  Paste any markdown on the left — any format works.
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
