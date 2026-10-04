import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Browse the full collection of recipes — filter by cuisine, difficulty, and cook time.",
  openGraph: {
    type: "website",
    title: "Recipes | Ben's Recipes",
    description:
      "Browse the full collection of recipes — filter by cuisine, difficulty, and cook time.",
  },
};

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
