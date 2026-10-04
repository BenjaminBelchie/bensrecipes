"use client";

import { useMemo } from "react";
import { useRecipes } from "~/components/RecipeDataProvider";
import Link from "next/link";
import { RecipePhoto } from "~/components/RecipePhoto";
import { AnimatePresence, motion } from "motion/react";
import { filterRecipes } from "~/lib/recipe-filters";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";

export default function RecipeGrid({
  selectedTags = [],
  difficulty = "",
  timeRange = "",
  cuisine = "",
  searchQuery = "",
}: {
  selectedTags?: string[];
  difficulty?: string;
  timeRange?: string;
  cuisine?: string;
  searchQuery?: string;
}) {
  const { snapshot, offline } = useRecipes();
  const allRecipes = snapshot?.recipes;

  const recipes = useMemo(() => {
    if (!allRecipes) return allRecipes;
    return filterRecipes(allRecipes, {
      searchQuery,
      selectedTags,
      difficulty,
      timeRange,
      cuisine,
    });
  }, [allRecipes, selectedTags, difficulty, timeRange, cuisine, searchQuery]);

  if (recipes === undefined || recipes === null) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
          >
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="p-5">
              <Skeleton className="mb-3 h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <span className="font-heading text-muted-foreground/10 text-8xl font-black">
          ✦
        </span>
        <p className="font-heading text-muted-foreground text-2xl font-bold">
          Nothing here yet
        </p>
        <p className="text-muted-foreground/70 max-w-xs text-sm">
          Recipes will appear here once added.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid gap-6 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {recipes.map((recipe) => (
          <motion.div
            key={recipe._id}
            className="flex min-w-0"
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <div className="group border-border bg-card hover:shadow-primary/10 relative flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              {/* Image / placeholder */}
              {recipe.imageUrl ? (
                <div
                  className="relative aspect-[4/3] shrink-0 overflow-hidden bg-black"
                  style={{ viewTransitionName: `recipe-image-${recipe._id}` }}
                >
                  <RecipePhoto
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    identity={recipe.imageId}
                    offline={offline}
                  />
                </div>
              ) : (
                <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
                  <div className="from-primary/8 via-primary/12 to-primary/5 flex h-full w-full items-center justify-center bg-gradient-to-br">
                    <span className="font-heading text-primary/20 text-6xl font-black">
                      ✦
                    </span>
                  </div>
                </div>
              )}

              {/* Title + tags */}
              <div className="flex min-w-0 flex-1 flex-col p-5">
                <h3
                  className="font-heading text-card-foreground group-hover:text-primary text-lg leading-tight font-bold transition-colors duration-200"
                  style={{ viewTransitionName: `recipe-title-${recipe._id}` }}
                >
                  <Link
                    href={`/recipes/${recipe._id}`}
                    prefetch={!offline}
                    draggable={false}
                    className="after:absolute after:inset-0"
                  >
                    {recipe.title}
                  </Link>
                </h3>
                {recipe.tags && recipe.tags.length > 0 && (
                  <ScrollArea className="relative z-10 mt-auto w-full cursor-auto pt-2.5">
                    <div className="flex w-max flex-nowrap gap-1.5 pb-3">
                      {recipe.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="shrink-0 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                )}
              </div>

              {/* Bottom accent bar that slides in on hover */}
              <div className="bg-primary absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
