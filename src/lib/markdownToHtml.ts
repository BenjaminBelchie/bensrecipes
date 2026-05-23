/**
 * Lightweight markdown → HTML renderer.
 * No dependencies. Handles headings, lists, bold/italic, code, HR, blockquotes, images, links.
 * Input is HTML-escaped first to prevent XSS; only our own safe tags are injected.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text: string): string {
  return (
    text
      // Bold + italic
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
      .replace(/_([^_\n]+?)_/g, "<em>$1</em>")
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Images (before links)
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img alt="$1" src="$2" style="max-width:100%;border-radius:6px;">',
      )
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      )
  );
}

export function markdownToHtml(markdown: string): string {
  // Escape all HTML in the source first
  const safe = escapeHtml(markdown);
  const lines = safe.split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i]!;
    const trimmed = raw.trim();

    // ── Fenced code block ──────────────────────────────────────────────────
    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trim().startsWith("```")) {
        codeLines.push(lines[i]!);
        i++;
      }
      out.push(`<pre><code>${codeLines.join("\n")}</code></pre>`);
      i++; // closing ```
      continue;
    }

    // ── Horizontal rule ────────────────────────────────────────────────────
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      out.push("<hr>");
      i++;
      continue;
    }

    // ── Heading ────────────────────────────────────────────────────────────
    const hm = /^(#{1,6})\s+(.*)/.exec(trimmed);
    if (hm) {
      const lvl = hm[1]!.length;
      out.push(`<h${lvl}>${inline(hm[2]!)}</h${lvl}>`);
      i++;
      continue;
    }

    // ── Blockquote (collect consecutive lines) ─────────────────────────────
    if (trimmed.startsWith("&gt; ") || trimmed.startsWith("&gt;")) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (lines[i]!.trim().startsWith("&gt; ") ||
          lines[i]!.trim() === "&gt;")
      ) {
        items.push(inline(lines[i]!.trim().replace(/^&gt;\s?/, "")));
        i++;
      }
      out.push(`<blockquote>${items.map((t) => `<p>${t}</p>`).join("")}</blockquote>`);
      continue;
    }

    // ── Unordered list (collect consecutive items, including sub-bullets) ──
    if (/^[-*+]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i]!.trim())) {
        items.push(`<li>${inline(lines[i]!.trim().replace(/^[-*+]\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // ── Ordered list ───────────────────────────────────────────────────────
    if (/^\d+[.)]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s/.test(lines[i]!.trim())) {
        items.push(
          `<li>${inline(lines[i]!.trim().replace(/^\d+[.)]\s+/, ""))}</li>`,
        );
        i++;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // ── Empty line ─────────────────────────────────────────────────────────
    if (trimmed === "") {
      i++;
      continue;
    }

    // ── Paragraph (collect until a blank line or block-level element) ──────
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== "" &&
      !/^#{1,6}\s/.test(lines[i]!.trim()) &&
      !/^[-*+]\s/.test(lines[i]!.trim()) &&
      !/^\d+[.)]\s/.test(lines[i]!.trim()) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i]!.trim()) &&
      !lines[i]!.trim().startsWith("```") &&
      !(lines[i]!.trim().startsWith("&gt;"))
    ) {
      paraLines.push(inline(lines[i]!.trim()));
      i++;
    }
    if (paraLines.length > 0) {
      out.push(`<p>${paraLines.join("<br>")}</p>`);
    }
  }

  return out.join("\n");
}
