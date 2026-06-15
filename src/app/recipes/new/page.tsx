"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "~/convex/_generated/api";
import {
  RecipeEditor,
  type RecipeEditorSaveData,
} from "~/components/RecipeEditor";

export default function NewRecipePage() {
  const router = useRouter();
  const createRecipe = useMutation(api.recipes.create);
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
      setError("Paste some markdown first.");
      return;
    }
    setError(null);
    try {
      await createRecipe({
        title,
        content: markdown,
        ...(imageId ? { imageId } : {}),
        ...(tags.length > 0 ? { tags } : {}),
        ...(difficulty ? { difficulty } : {}),
        ...(totalTime ? { totalTime } : {}),
        ...(cuisine ? { cuisine } : {}),
      });
      toast.success("Recipe created successfully!");
      router.push(`/admin/`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save recipe.");
    }
  }

  return (
    <RecipeEditor
      headerTitle="New Recipe"
      saveLabel="Save Recipe →"
      error={error}
      onSave={handleSave}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Admin", href: "/admin" },
        { label: "New Recipe" },
      ]}
    />
  );
}
