"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { api } from "../../../../convex/_generated/api";
import { type Id } from "../../../../convex/_generated/dataModel";
import { markdownToHtml } from "~/lib/markdownToHtml";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const recipe = useQuery(api.recipes.getById, { id: id as Id<"recipes"> });

  if (recipe === undefined) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-400">Loading…</p></div>;
  }
  if (recipe === null) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-500">Recipe not found.</p></div>;
  }

  const html = markdownToHtml(recipe.content);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {recipe.imageUrl && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl">
          <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" />
        </div>
      )}
      <article
        className="prose prose-stone max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
