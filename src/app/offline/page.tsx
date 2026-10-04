import type { Metadata } from "next";
import { OfflineApp } from "~/components/OfflineApp";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Saved Recipes",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return <OfflineApp />;
}
