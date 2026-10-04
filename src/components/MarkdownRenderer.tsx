import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { RecipePhoto } from "~/components/RecipePhoto";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  offline?: boolean;
}

export function MarkdownRenderer({
  content,
  className,
  offline = false,
}: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          img: ({ src, alt }) =>
            typeof src === "string" ? (
              <RecipePhoto
                src={src}
                alt={alt ?? "Recipe photo"}
                offline={offline}
                inline
              />
            ) : null,
        }}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
