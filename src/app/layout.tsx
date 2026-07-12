import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { UserNav } from "~/components/UserNav";
import { Toaster } from "~/components/ui/sonner";
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

const BASE_URL = "https://bensrecipes.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  applicationName: "Ben's Recipes",
  title: {
    default: "Ben's Recipes",
    template: "%s | Ben's Recipes",
  },
  description:
    "A personal collection of recipes I love — simple ingredients, extraordinary results.",
  keywords: ["recipes", "cooking", "food", "homemade", "Ben's Recipes"],
  authors: [{ name: "Ben", url: BASE_URL }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Ben's Recipes",
    title: "Ben's Recipes",
    description:
      "A personal collection of recipes I love — simple ingredients, extraordinary results.",
    url: BASE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ben's Recipes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ben's Recipes",
    description:
      "A personal collection of recipes I love — simple ingredients, extraordinary results.",
    images: ["/og-image.png"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ben's Recipes",
  url: BASE_URL,
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <ClerkProvider>
          <ConvexClientProvider>
            <header
              className="bg-background sticky top-0 z-50 border-b border-black/8 backdrop-blur-xl"
              style={{ viewTransitionName: "site-header" }}
            >
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link
                  href="/"
                  className="font-heading text-foreground text-xl font-black tracking-tight"
                >
                  Ben<span className="text-primary">&apos;s</span> Recipes
                </Link>
                <nav className="flex items-center gap-6 text-sm">
                  <Link
                    href="/recipes"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Recipes
                  </Link>
                  <UserNav />
                </nav>
              </div>
            </header>
            <main>{children}</main>
            <Toaster />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
