"use client";

import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";
import { useOnline } from "~/hooks/use-online";

export function UserNav() {
  const online = useOnline();
  const { sessionClaims } = useAuth();
  const isAdmin = sessionClaims?.metadata?.role === "admin";
  if (!online) return null;

  return (
    <div className="flex items-center gap-6 text-sm">
      <Unauthenticated>
        <SignInButton>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </button>
        </SignInButton>
      </Unauthenticated>
      <Authenticated>
        {isAdmin && (
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin
          </Link>
        )}
        <UserButton />
      </Authenticated>
    </div>
  );
}
