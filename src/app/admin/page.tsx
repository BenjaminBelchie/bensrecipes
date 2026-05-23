"use client";

import { useUser } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Admin</h1>
        <p className="mb-8 text-gray-500">Clerk + Convex connection test</p>

        <AuthLoading>
          <StatusCard status="loading" title="Checking auth..." />
        </AuthLoading>

        <Unauthenticated>
          <StatusCard
            status="error"
            title="Not signed in"
            detail="Sign in via the header to access this page."
          />
        </Unauthenticated>

        <Authenticated>
          <AuthenticatedContent />
        </Authenticated>
      </div>
    </main>
  );
}

function AuthenticatedContent() {
  const { user } = useUser();
  const recipes = useQuery(api.recipes.get);

  return (
    <div className="flex flex-col gap-6">
      {/* Clerk status */}
      <section className="rounded-xl border border-green-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <h2 className="font-semibold text-gray-800">Clerk — Authenticated</h2>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <dt className="text-gray-500">Name</dt>
          <dd className="font-medium text-gray-900">{user?.fullName ?? "—"}</dd>
          <dt className="text-gray-500">Email</dt>
          <dd className="font-medium text-gray-900">
            {user?.primaryEmailAddress?.emailAddress ?? "—"}
          </dd>
          <dt className="text-gray-500">User ID</dt>
          <dd className="break-all font-mono text-xs text-gray-600">{user?.id}</dd>
          <dt className="text-gray-500">Created</dt>
          <dd className="text-gray-900">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </dd>
        </dl>
      </section>

      {/* Convex status */}
      <section className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              recipes === undefined ? "bg-yellow-400" : "bg-blue-500"
            }`}
          />
          <h2 className="font-semibold text-gray-800">
            Convex —{" "}
            {recipes === undefined
              ? "Fetching data..."
              : `${recipes.length} recipes loaded`}
          </h2>
        </div>

        {recipes === undefined ? (
          <p className="text-sm text-gray-400">Loading from Convex...</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recipes.map((recipe) => (
              <li key={recipe._id}>
                <Link
                  href={`/recipes/${recipe._id}`}
                  className="flex items-start justify-between gap-4 py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{recipe.title}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Raw Convex document ID sample */}
      {recipes && recipes.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-800">Sample Convex Document</h2>
          <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-700">
            {JSON.stringify(recipes[0], null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}

function StatusCard({
  status,
  title,
  detail,
}: {
  status: "loading" | "error" | "success";
  title: string;
  detail?: string;
}) {
  const colors = {
    loading: "border-yellow-200 bg-yellow-50 text-yellow-800",
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-green-200 bg-green-50 text-green-800",
  };
  return (
    <div className={`rounded-xl border p-6 ${colors[status]}`}>
      <p className="font-semibold">{title}</p>
      {detail && <p className="mt-1 text-sm opacity-80">{detail}</p>}
    </div>
  );
}
