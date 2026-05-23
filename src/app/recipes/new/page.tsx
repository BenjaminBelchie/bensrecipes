"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { DM_Serif_Display, Newsreader } from "next/font/google";
import { api } from "../../../../convex/_generated/api";
import { markdownToHtml } from "~/lib/markdownToHtml";

const display = DM_Serif_Display({ subsets: ["latin"], weight: "400" });
const body = Newsreader({ subsets: ["latin"], weight: ["400", "500"] });

const PLACEHOLDER = `# Death by Chocolate Layer Cake

A tall, rich, ultra-chocolatey layered cake.

---

## Ingredients

- 220g plain flour
- 75g cocoa powder
- 3 large eggs

## Method

1. Preheat oven to **170°C fan**.
2. Mix dry ingredients together.
3. Add wet ingredients and fold until combined.
`;

/** Extract the first # H1 from markdown, fall back to first non-empty line */
function extractTitle(md: string): string {
  for (const line of md.split("\n")) {
    const h1 = /^#\s+(.*)/.exec(line);;
    if (h1) return h1[1]!.trim();
    if (line.trim()) return line.trim().slice(0, 80);
  }
  return "Untitled Recipe";
}

export default function NewRecipePage() {
  const router = useRouter();
  const createRecipe = useMutation(api.recipes.create);
  const [markdown, setMarkdown] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const title = useMemo(() => (markdown.trim() ? extractTitle(markdown) : ""), [markdown]);
  const previewHtml = useMemo(() => (markdown.trim() ? markdownToHtml(markdown) : ""), [markdown]);

  function handleSubmit() {
    if (!markdown.trim()) { setError("Paste some markdown first."); return; }
    setError(null);
    startTransition(async () => {
      try {
        const id = await createRecipe({ title, content: markdown });
        router.push(`/recipes/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save recipe.");
      }
    });
  }

  return (
    <div className={`${body.className} min-h-screen`} style={{ background: "#f8f4ee" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #d8cfc4", background: "#f8f4ee", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className={display.className} style={{ fontSize: "1.25rem", color: "#2d4a3e", letterSpacing: "-0.01em" }}>
            {title || "New Recipe"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={handleSubmit}
              disabled={isPending || !markdown.trim()}
              style={{
                background: markdown.trim() && !isPending ? "#2d4a3e" : "#a0998e",
                color: "#f8f4ee", border: "none", borderRadius: 6,
                padding: "0.45rem 1.25rem", fontSize: "0.875rem",
                fontFamily: "inherit", cursor: markdown.trim() && !isPending ? "pointer" : "not-allowed",
                transition: "background 0.15s", fontWeight: 500,
              }}
            >
              {isPending ? "Saving…" : "Save Recipe →"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="md:hidden" style={{ display: "flex", borderBottom: "1px solid #d8cfc4", background: "#f0ebe2" }}>
        {(["edit", "preview"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "0.65rem", fontSize: "0.8rem", fontFamily: "inherit", border: "none", background: tab === t ? "#f8f4ee" : "transparent", borderBottom: tab === t ? "2px solid #2d4a3e" : "2px solid transparent", color: tab === t ? "#2d4a3e" : "#8a7968", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
            {t === "edit" ? "Write" : "Preview"}
          </button>
        ))}
      </div>

      {/* Split pane */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 57px)" }} className="max-md:block">
        {/* Editor */}
        <div className={tab === "preview" ? "hidden md:flex" : "flex"} style={{ flexDirection: "column", borderRight: "1px solid #d8cfc4" }}>
          <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid #d8cfc4", background: "#f0ebe2", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#8a7968", fontWeight: 500 }}>Markdown</span>
            <button onClick={() => setMarkdown(PLACEHOLDER)} style={{ fontSize: "0.75rem", color: "#5a7a6a", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
              Load example
            </button>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={"Paste your recipe in markdown...\n\n# Recipe Title\n\n## Ingredients\n- item\n\n## Method\n1. Step one"}
            spellCheck={false}
            style={{ flex: 1, resize: "none", border: "none", outline: "none", padding: "2rem", fontSize: "0.875rem", lineHeight: 1.75, fontFamily: "'Courier New', Courier, monospace", background: "#f8f4ee", color: "#2c2417", caretColor: "#2d4a3e", minHeight: 500 }}
          />
          {error && (
            <div style={{ padding: "0.75rem 1.5rem", borderTop: "1px solid #e8b4b8", background: "#fdf0f0", color: "#8b2020", fontSize: "0.8rem" }}>
              {error}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className={tab === "edit" ? "hidden md:block" : "block"} style={{ overflowY: "auto" }}>
          {!previewHtml ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "4rem 2rem", gap: "0.75rem", color: "#a09080", textAlign: "center" }}>
              <span style={{ fontSize: "2.5rem" }}>📝</span>
              <p className={display.className} style={{ fontSize: "1.4rem", color: "#c0b09a" }}>Your recipe preview</p>
              <p style={{ fontSize: "0.85rem", maxWidth: 280, lineHeight: 1.6 }}>Paste any markdown on the left — any format works.</p>
            </div>
          ) : (
            <div style={{ padding: "2.5rem 3rem" }}>
              <article
                className="prose prose-stone max-w-none"
                style={{ "--tw-prose-headings": "#2d4a3e", "--tw-prose-body": "#2c2417", fontFamily: body.style.fontFamily } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
