"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import RecipeGrid from "~/components/RecipeGrid";
import { api } from "~/convex/_generated/api";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export default function RecipesPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const availableTags = useQuery(api.tags.list) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 md:py-12">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Recipes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-10">
        <h1 className="font-heading text-foreground mb-6 text-3xl font-bold">
          All Recipes
        </h1>

        {/* Tag filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground mr-1 text-xs font-medium tracking-widest uppercase">
            Filter
          </span>
          <ToggleGroup
            type="multiple"
            value={selectedTags}
            onValueChange={setSelectedTags}
            variant="outline"
            size="sm"
            className="flex-wrap"
          >
            {availableTags.map((tag) => (
              <ToggleGroupItem key={tag} value={tag}>
                {tag}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="text-muted-foreground hover:text-foreground ml-1 text-xs underline-offset-2 transition-colors hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <RecipeGrid selectedTags={selectedTags} />
    </div>
  );
}
