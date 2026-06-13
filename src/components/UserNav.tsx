"use client";

import { UserButton, SignInButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";

export function UserNav() {
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
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Admin
        </Link>
        <UserButton />
      </Authenticated>
    </div>
  );
}
