"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { imageCacheUrl } from "~/lib/offline-images";

export function RecipePhoto({
  src,
  alt,
  identity,
  offline = false,
  inline = false,
}: {
  src: string;
  alt: string;
  identity?: string;
  offline?: boolean;
  inline?: boolean;
}) {
  const source = offline ? imageCacheUrl(src, identity) : src;
  const [failedSource, setFailedSource] = useState<string>();
  if (failedSource === source)
    return (
      <span className="bg-muted text-muted-foreground flex h-full min-h-16 items-center justify-center gap-2 p-4 text-sm">
        <ImageOff className="size-4" />
        Photo unavailable{offline ? " offline" : ""}
      </span>
    );
  return inline ? (
    <Image
      src={source}
      alt={alt}
      width={960}
      height={640}
      unoptimized={offline}
      className="h-auto max-w-full"
      onError={() => setFailedSource(source)}
    />
  ) : (
    <Image
      src={source}
      alt={alt}
      fill
      unoptimized={offline}
      sizes="(max-width: 767px) 100vw, 672px"
      className="object-cover"
      onError={() => setFailedSource(source)}
    />
  );
}
