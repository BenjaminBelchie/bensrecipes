import { type MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "~/convex/_generated/api";

const BASE_URL = "https://bensrecipes.co.uk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await fetchQuery(api.recipes.get, {});

  const recipeEntries: MetadataRoute.Sitemap = recipes.map((recipe) => ({
    url: `${BASE_URL}/recipes/${recipe._id}`,
    lastModified: new Date(recipe._creationTime),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/recipes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...recipeEntries,
  ];
}
