import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { api } from "~/convex/_generated/api";
import { type Id } from "~/convex/_generated/dataModel";
import { RecipeContent } from "~/components/RecipeContent";

const BASE_URL = "https://bensrecipes.co.uk";

/** Strip markdown syntax for use in plain-text meta tags */
function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = await fetchQuery(api.recipes.getById, {
    id: id as Id<"recipes">,
  });

  if (!recipe) return {};

  const description = stripMarkdown(recipe.content).slice(0, 160);
  const canonicalUrl = `${BASE_URL}/recipes/${recipe._id}`;

  return {
    title: recipe.title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title: recipe.title,
      description,
      url: canonicalUrl,
      ...(recipe.imageUrl && {
        images: [
          { url: recipe.imageUrl, width: 1200, height: 630, alt: recipe.title },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description,
      ...(recipe.imageUrl && { images: [recipe.imageUrl] }),
    },
  };
}

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

  const canonicalUrl = `${BASE_URL}/recipes/${recipe._id}`;
  const description = stripMarkdown(recipe.content).slice(0, 160);

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description,
    url: canonicalUrl,
    author: {
      "@type": "Person",
      name: "Ben",
    },
    ...(recipe.imageUrl && { image: recipe.imageUrl }),
    ...(recipe.totalTime && { totalTime: `PT${recipe.totalTime}M` }),
    ...(recipe.cuisine && { recipeCuisine: recipe.cuisine }),
    ...(recipe.difficulty && {
      difficulty: recipe.difficulty,
    }),
    ...(recipe.tags &&
      recipe.tags.length > 0 && {
        keywords: recipe.tags.join(", "),
      }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />
      <RecipeContent recipe={recipe} />
    </>
  );
}
