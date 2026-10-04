import type { PublicRecipe } from "~/lib/offline-db";

export interface RecipeFilters {
  selectedTags?: string[];
  difficulty?: string;
  timeRange?: string;
  cuisine?: string;
  searchQuery?: string;
}

export function filterRecipes(
  recipes: PublicRecipe[],
  {
    selectedTags = [],
    difficulty = "",
    timeRange = "",
    cuisine = "",
    searchQuery = "",
  }: RecipeFilters,
) {
  const search = searchQuery.trim().toLowerCase();
  return recipes.filter((recipe) => {
    if (search && !recipe.title.toLowerCase().includes(search)) return false;
    if (
      selectedTags.length &&
      !selectedTags.every((tag) => recipe.tags?.includes(tag))
    )
      return false;
    if (difficulty && recipe.difficulty !== difficulty) return false;
    if (timeRange) {
      const time = recipe.totalTime;
      if (time === undefined || time === null) return false;
      if (timeRange === "lt15" && time >= 15) return false;
      if (timeRange === "15to30" && (time < 15 || time > 30)) return false;
      if (timeRange === "30to60" && (time < 30 || time > 60)) return false;
      if (timeRange === "gt60" && time <= 60) return false;
    }
    return !cuisine || recipe.cuisine?.toLowerCase() === cuisine.toLowerCase();
  });
}
