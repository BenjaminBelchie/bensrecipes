import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { api } from "~/convex/_generated/api";
import { type Id } from "~/convex/_generated/dataModel";
import { MarkdownRenderer } from "~/components/MarkdownRenderer";
import { Badge } from "~/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

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
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-12">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/recipes">Recipes</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate">
                {recipe.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {recipe.imageUrl && (
          <div
            className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl bg-black"
            style={{ viewTransitionName: `recipe-image-${recipe._id}` }}
          >
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <h1
          className="font-heading text-foreground mb-6 text-3xl leading-tight font-bold"
          style={{ viewTransitionName: `recipe-title-${recipe._id}` }}
        >
          {recipe.title}
        </h1>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <MarkdownRenderer
          content={recipe.content.replace(/^#[^\n]*\n?/, "")}
          className="prose prose-stone max-w-none"
        />
      </div>
    </>
  );
}
