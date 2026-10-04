"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, X } from "lucide-react";
import { useOnlineMutation } from "~/hooks/use-online-mutation";
import { type Id } from "~/convex/_generated/dataModel";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { useOnline } from "~/hooks/use-online";

interface ImageUploadProps {
  /** Current image URL to preview (from storage or external) */
  currentImageUrl?: string | null;
  /** Called with the new storageId after a successful upload, or null if removed */
  onUpload: (imageId: Id<"_storage"> | null) => void;
}

export function ImageUpload({ currentImageUrl, onUpload }: ImageUploadProps) {
  const online = useOnline();
  const generateUploadUrl = useOnlineMutation(api.recipes.generateUploadUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!navigator.onLine) {
      setError("Image uploads require a connection.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) throw new Error("Upload failed");
      const { storageId } = (await response.json()) as { storageId: string };
      setPreview(URL.createObjectURL(file));
      onUpload(storageId as Id<"_storage">);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    onUpload(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="border-border flex items-center gap-2 border-b px-6 py-3">
      {preview ? (
        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={preview}
            alt="Recipe image preview"
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <div className="bg-muted text-muted-foreground flex h-12 w-20 shrink-0 items-center justify-center rounded-lg">
          <ImageIcon className="size-5" />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || !online}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" />
              Uploading…
            </>
          ) : preview ? (
            "Replace"
          ) : (
            "Upload image"
          )}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            <X />
            Remove
          </Button>
        )}
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
