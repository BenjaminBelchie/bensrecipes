import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import RecipeGrid from "~/components/RecipeGrid";
import HeroSection, {
  type RecipeHighlight,
} from "~/components/blocks/hero-section-41";

const recipeHighlights: RecipeHighlight[] = [
  {
    id: 1,
    img: "https://cdn.shadcnstudio.com/ss-assets/template/landing-page/bistro/image-18.png",
    imgAlt: "A beautifully plated dish",
    caption: "Simple ingredients, extraordinary results.",
  },
  {
    id: 2,
    img: "https://cdn.shadcnstudio.com/ss-assets/template/landing-page/bistro/image-19.png",
    imgAlt: "A fresh and vibrant plate",
    caption: "Cooked slow, savoured even slower.",
  },
  {
    id: 3,
    img: "https://cdn.shadcnstudio.com/ss-assets/template/landing-page/bistro/image-20.png",
    imgAlt: "A rich and hearty meal",
    caption: "The kind of dish you make twice in one week.",
  },
  {
    id: 4,
    img: "https://cdn.shadcnstudio.com/ss-assets/template/landing-page/bistro/image-05.png",
    imgAlt: "An elegant dinner presentation",
    caption: "Good food doesn't need a reason.",
  },
];

export default async function HomePage() {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.role === "admin";
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <HeroSection recipeHighlights={recipeHighlights} />

      {/* Ornamental divider */}
      <div className="mx-auto flex max-w-xs items-center gap-4 py-10">
        <div className="bg-border h-px flex-1" />
        <span className="font-heading text-muted-foreground/30 text-xl">✦</span>
        <div className="bg-border h-px flex-1" />
      </div>

      {/* ── Recipe Grid ────────────────────────────────────────── */}
      <section id="recipes" className="mx-auto max-w-6xl px-6 pb-28">
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="font-heading text-foreground text-3xl font-bold">
            All Recipes
          </h2>
          {isAdmin && (
            <Link
              href="/recipes/new"
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              + New Recipe
            </Link>
          )}
        </div>

        <RecipeGrid />
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-border text-muted-foreground border-t py-8 text-center text-sm">
        <span className="font-heading font-semibold">Ben&apos;s Recipes</span> —
        Made with care
      </footer>
    </div>
  );
}
