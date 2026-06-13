import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { Plus, Eye, Pencil, ChefHat } from "lucide-react";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty";

export default async function AdminPage() {
  const recipes = await fetchQuery(api.recipes.get);

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight">
              Admin
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your recipe collection
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/recipes/new">
              <Plus />
              New Recipe
            </Link>
          </Button>
        </div>

        <div className="border-border overflow-hidden rounded-2xl border">
          {/* List header */}
          <div className="border-border bg-muted/40 flex items-center justify-between border-b px-5 py-3">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Recipes
            </span>
            <Badge variant="secondary">{recipes.length}</Badge>
          </div>

          {recipes.length === 0 ? (
            <Empty className="rounded-none border-0 py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ChefHat />
                </EmptyMedia>
                <EmptyTitle>No recipes yet</EmptyTitle>
                <EmptyDescription>
                  Add your first recipe to get started.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild size="sm">
                  <Link href="/recipes/new">
                    <Plus />
                    New Recipe
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <ul>
              {recipes.map((recipe, i) => (
                <li key={recipe._id}>
                  {i > 0 && <Separator />}
                  <div className="hover:bg-muted/30 flex items-center justify-between gap-4 px-5 py-3.5 transition-colors">
                    <span className="text-foreground min-w-0 truncate text-sm font-medium">
                      {recipe.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="outline" size="xs" asChild>
                        <Link href={`/recipes/${recipe._id}`}>
                          <Eye />
                          View
                        </Link>
                      </Button>
                      <Button variant="secondary" size="xs" asChild>
                        <Link href={`/recipes/${recipe._id}/edit`}>
                          <Pencil />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
