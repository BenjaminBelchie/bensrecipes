"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { Plus, Eye, Pencil, ChefHat, Clipboard, ClipboardCheck } from "lucide-react";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { DeleteRecipeButton } from "~/components/DeleteRecipeButton";
import { RECIPE_PROMPT } from "~/lib/recipe-prompt";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";

export default function AdminPage() {
  const recipes = useQuery(api.recipes.get);
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(RECIPE_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-6 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Admin</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyPrompt}
              aria-label="Copy recipe prompt"
            >
              {copied ? <ClipboardCheck /> : <Clipboard />}
              <span className="hidden md:inline">
                {copied ? "Copied!" : "Copy Prompt"}
              </span>
            </Button>
            <Button asChild size="sm" aria-label="New Recipe">
              <Link href="/recipes/new">
                <Plus />
                <span className="hidden md:inline">New Recipe</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="border-border overflow-hidden rounded-2xl border">
          {/* List header */}
          <div className="border-border bg-muted/40 flex items-center justify-between border-b px-5 py-3">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Recipes
            </span>
            {recipes !== undefined && (
              <Badge variant="secondary">{recipes.length}</Badge>
            )}
          </div>

          {recipes === undefined ? (
            <div className="divide-border divide-y">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <Skeleton className="h-4 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-14" />
                    <Skeleton className="h-7 w-14" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : recipes.length === 0 ? (
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
                      <Button variant="outline" size="xs" asChild aria-label="View">
                        <Link href={`/recipes/${recipe._id}`}>
                          <Eye />
                          <span className="hidden md:inline">View</span>
                        </Link>
                      </Button>
                      <Button variant="secondary" size="xs" asChild aria-label="Edit">
                        <Link href={`/recipes/${recipe._id}/edit`}>
                          <Pencil />
                          <span className="hidden md:inline">Edit</span>
                        </Link>
                      </Button>
                      <DeleteRecipeButton id={recipe._id} title={recipe.title} />
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
