"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import Image from "next/image";
import { api } from "~/convex/_generated/api";
import { Skeleton } from "~/components/ui/skeleton";

export default function RecipeGrid() {
  const recipes = useQuery(api.recipes.get);

  if (recipes === undefined) {
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <Link
          key={recipe._id}
          href={`/recipes/${recipe._id}`}
          className="group border-border bg-card hover:shadow-primary/10 relative overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
        >
          {/* Image / placeholder */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {recipe.imageUrl ? (
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="from-primary/8 via-primary/12 to-primary/5 flex h-full w-full items-center justify-center bg-gradient-to-br">
                <span className="font-heading text-primary/20 text-6xl font-black">
                  ✦
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="p-5">
            <h3 className="font-heading text-card-foreground group-hover:text-primary text-lg leading-tight font-bold transition-colors duration-200">
              {recipe.title}
            </h3>
          </div>

          {/* Bottom accent bar that slides in on hover */}
          <div className="bg-primary absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
        </Link>
      ))}
    </div>
  );
}
