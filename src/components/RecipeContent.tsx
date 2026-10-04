import Link from "next/link";
import type { PublicRecipe } from "~/lib/offline-db";
import { RecipePhoto } from "~/components/RecipePhoto";
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

export function RecipeContent({
  recipe,
  offline = false,
}: {
  recipe: PublicRecipe;
  offline?: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-12">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" prefetch={!offline}>
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/recipes" prefetch={!offline}>
                Recipes
              </Link>
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
          <RecipePhoto
            src={recipe.imageUrl}
            identity={recipe.imageId}
            alt={recipe.title}
            offline={offline}
          />
        </div>
      )}
      <h1
        className="font-heading text-foreground mb-6 text-3xl leading-tight font-bold"
        style={{ viewTransitionName: `recipe-title-${recipe._id}` }}
      >
        {recipe.title}
      </h1>
      {!!recipe.tags?.length && (
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
        offline={offline}
      />
    </div>
  );
}
