export type RecipeForMarkdown = {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  category?: string | null;
};

/**
 * Converts a structured recipe object into a consistently formatted
 * Markdown document ready for rendering with react-markdown.
 */
export function recipeToMarkdown(recipe: RecipeForMarkdown): string {
  const lines: string[] = [];

  // Title
  lines.push(`# ${recipe.title}`);
  lines.push("");

  // Meta badges line
  const meta: string[] = [];
  if (recipe.prepTime) meta.push(`**Prep:** ${recipe.prepTime} min`);
  if (recipe.cookTime) meta.push(`**Cook:** ${recipe.cookTime} min`);
  if (recipe.prepTime && recipe.cookTime)
    meta.push(`**Total:** ${recipe.prepTime + recipe.cookTime} min`);
  if (recipe.servings) meta.push(`**Serves:** ${recipe.servings}`);
  if (recipe.category) meta.push(`**Category:** ${recipe.category}`);
  if (meta.length) {
    lines.push(meta.join(" · "));
    lines.push("");
  }

  // Description
  if (recipe.description) {
    lines.push(recipe.description);
    lines.push("");
  }

  // Ingredients
  lines.push("## Ingredients");
  lines.push("");
  for (const ingredient of recipe.ingredients) {
    lines.push(`- ${ingredient}`);
  }
  lines.push("");

  // Steps
  lines.push("## Method");
  lines.push("");
  recipe.steps.forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`);
  });

  return lines.join("\n");
}
