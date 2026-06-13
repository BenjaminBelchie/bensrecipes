import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { UserNav } from "~/components/UserNav";
import "~/styles/globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ben's Recipes",
  description: "A personal collection of recipes I love.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSans.variable}`}
    >
      <body className="bg-background text-foreground font-sans antialiased">
        <ClerkProvider>
          <ConvexClientProvider>
            <header className="bg-background sticky top-0 z-50 border-b border-black/8 backdrop-blur-xl">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link
                  href="/"
                  className="font-heading text-foreground text-xl font-black tracking-tight"
                >
                  Ben<span className="text-primary">&apos;s</span> Recipes
                </Link>
                <nav className="flex items-center gap-6 text-sm">
                  <UserNav />
                </nav>
              </div>
            </header>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
