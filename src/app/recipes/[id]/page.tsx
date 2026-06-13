import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import Image from "next/image";
import { api } from "~/convex/_generated/api";
import { type Id } from "~/convex/_generated/dataModel";
import { MarkdownRenderer } from "~/components/MarkdownRenderer";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await fetchQuery(api.recipes.getById, {
    id: id as Id<"recipes">,
  });

  if (!recipe) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {recipe.imageUrl && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <MarkdownRenderer
        content={recipe.content}
        className="prose prose-stone max-w-none"
      />
    </div>
  );
}
