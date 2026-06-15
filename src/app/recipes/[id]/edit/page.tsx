"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "~/convex/_generated/api";
import { type Id } from "~/convex/_generated/dataModel";
import {
  RecipeEditor,
  type RecipeEditorSaveData,
} from "~/components/RecipeEditor";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const recipe = useQuery(api.recipes.getById, { id: id as Id<"recipes"> });
  const updateRecipe = useMutation(api.recipes.update);
  const [error, setError] = useState<string | null>(null);

  async function handleSave({
    title,
    markdown,
    imageId,
    tags,
    difficulty,
    totalTime,
    cuisine,
  }: RecipeEditorSaveData) {
    if (!markdown.trim()) {
      setError("Recipe content cannot be empty.");
      return;
    }
    setError(null);
    try {
      await updateRecipe({
        id: id as Id<"recipes">,
        title,
        content: markdown,
        ...(imageId ? { imageId } : {}),
        ...(tags.length > 0 ? { tags } : {}),
        ...(difficulty ? { difficulty } : {}),
        ...(totalTime ? { totalTime } : {}),
        ...(cuisine ? { cuisine } : {}),
      });
      toast.success("Recipe updated!");
      router.push(`/admin`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save changes.");
    }
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
    <RecipeEditor
      initialRecipe={{
        markdown: recipe.content,
        imageId: recipe.imageId ?? null,
        imageUrl: recipe.imageUrl ?? null,
        tags: recipe.tags ?? [],
        difficulty: recipe.difficulty,
        totalTime: recipe.totalTime,
        cuisine: recipe.cuisine,
      }}
      headerTitle="Edit Recipe"
      saveLabel="Save Changes →"
      error={error}
      onSave={handleSave}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Admin", href: "/admin" },
        { label: recipe.title, href: `/recipes/${id}` },
        { label: "Edit" },
      ]}
    />
  );
}
