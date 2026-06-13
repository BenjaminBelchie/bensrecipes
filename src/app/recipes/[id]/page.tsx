import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import Link from "next/link";
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
      <div className="mb-8">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          ← All Recipes
        </Link>
      </div>
      {recipe.imageUrl && (
        <div
          className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl bg-black"
          style={{ viewTransitionName: `recipe-image-${recipe._id}` }}
        >
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-contain"
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
