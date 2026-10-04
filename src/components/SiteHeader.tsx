import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import logo from "~/app/bensrecipes_logo.png";
import { PwaTools } from "~/components/PwaTools";

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header
      className="bg-background site-header sticky top-0 z-50 border-b border-black/8 backdrop-blur-xl"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-6">
        <Link
          href="/"
          className="font-heading text-foreground flex shrink-0 items-center gap-2 text-base font-black sm:text-xl"
        >
          <Image
            src={logo}
            alt=""
            width={32}
            height={32}
            unoptimized
            className="size-8 shrink-0 object-contain"
          />
          <span>
            Ben<span className="text-primary">&apos;s</span> Recipes
          </span>
        </Link>
        <nav className="ml-auto flex shrink-0 items-center gap-2 text-sm whitespace-nowrap sm:gap-6">
          <Link
            href="/recipes"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Recipes
          </Link>
          {children ?? <PwaTools />}
        </nav>
      </div>
    </header>
  );
}
