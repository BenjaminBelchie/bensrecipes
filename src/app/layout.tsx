import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { PwaRegistration } from "~/components/PwaRegistration";
import startupImages from "../../public/splash/apple-startup-images.json";
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
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Ben's Recipes",
    statusBarStyle: "default",
    startupImage: startupImages,
  },
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
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
        {children}
        <PwaRegistration />
        <Toaster />
      </body>
    </html>
  );
}
