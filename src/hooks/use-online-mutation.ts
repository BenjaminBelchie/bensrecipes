"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexHttpClient } from "convex/browser";
import type {
  FunctionReference,
  FunctionArgs,
  FunctionReturnType,
} from "convex/server";

export function useOnlineMutation<
  Reference extends FunctionReference<"mutation">,
>(reference: Reference) {
  const { getToken } = useAuth();
  return async (
    args: FunctionArgs<Reference> = {},
  ): Promise<FunctionReturnType<Reference>> => {
    if (!navigator.onLine)
      throw new Error("Recipe management requires a connection.");
    const token = await getToken({ template: "convex" });
    if (!token || !navigator.onLine)
      throw new Error("Sign in while online to manage recipes.");
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    client.setAuth(token);
    return client.mutation(reference, args);
  };
}
