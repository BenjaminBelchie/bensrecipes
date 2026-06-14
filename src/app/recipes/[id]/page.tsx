import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
            <BreadcrumbPage className="max-w-[200px] truncate">{recipe.title}</BreadcrumbPage>
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
            className="object-contain"
          />
        </div>
      )}
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
        content={recipe.content}
        className="prose prose-stone max-w-none"
      />
    </div>
  );
}
