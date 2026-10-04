import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "~/app/ConvexClientProvider";
import { SiteHeader } from "~/components/SiteHeader";
import { UserNav } from "~/components/UserNav";
import { OnlineRecipeProvider } from "~/components/RecipeDataProvider";
import { PwaTools } from "~/components/PwaTools";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <OnlineRecipeProvider>
          <SiteHeader>
            <UserNav />
          </SiteHeader>
          <PwaTools />
          <main>{children}</main>
        </OnlineRecipeProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
