"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation } from "convex/react";
import { PlusIcon, X } from "lucide-react";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxSeparator,
  useComboboxAnchor,
} from "~/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface TagSelectProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelect({ value, onChange }: TagSelectProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const tagAnchor = useComboboxAnchor();
  const tagAnchorMobile = useComboboxAnchor();

  const availableTags = useQuery(api.tags.list) ?? [];
  const createTag = useMutation(api.tags.create);

  const createTagForm = useForm({
    defaultValues: { name: "" },
    validators: {
      onSubmit: ({ value: formValue }) => {
        if (!formValue.name.trim()) return "Tag name cannot be empty.";
        if (availableTags.includes(formValue.name.trim()))
          return "Tag already exists.";
        return undefined;
      },
    },
    onSubmit: async ({ value: formValue }) => {
      const trimmed = formValue.name.trim();
      try {
        await createTag({ name: trimmed });
      } catch {
        // already exists — still select it
      }
      onChange(value.includes(trimmed) ? value : [...value, trimmed]);
      setCreateDialogOpen(false);
      createTagForm.reset();
    },
  });

  return (
    <>
      <div className="border-border border-b px-6 py-4">
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
          Tags
        </p>

        {/* Mobile: chips above, plain search input */}
        <div className="md:hidden">
          {value.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {value.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((t) => t !== tag))}
                    aria-label={`Remove ${tag}`}
                    className="transition-opacity hover:opacity-70"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <Combobox multiple value={value} onValueChange={onChange}>
            <ComboboxChips ref={tagAnchorMobile} className="w-full">
              <ComboboxChipsInput placeholder="Search tags…" />
            </ComboboxChips>
            <ComboboxContent anchor={tagAnchorMobile} align="start">
              <ComboboxList>
                {availableTags.map((tag) => (
                  <ComboboxItem key={tag} value={tag}>
                    {tag}
                  </ComboboxItem>
                ))}
              </ComboboxList>
              <ComboboxSeparator />
              <div className="p-1">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setCreateDialogOpen(true);
                  }}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
                >
                  <PlusIcon className="size-4" />
                  Create new tag
                </button>
              </div>
            </ComboboxContent>
          </Combobox>
        </div>

        {/* Desktop: chips inside the input */}
        <div className="hidden md:block">
          <Combobox multiple value={value} onValueChange={onChange}>
            <ComboboxChips ref={tagAnchor} className="w-full">
              {value.map((tag) => (
                <ComboboxChip key={tag}>{tag}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder="Search tags…" />
            </ComboboxChips>
            <ComboboxContent anchor={tagAnchor} align="start">
              <ComboboxList>
                {availableTags.map((tag) => (
                  <ComboboxItem key={tag} value={tag}>
                    {tag}
                  </ComboboxItem>
                ))}
              </ComboboxList>
              <ComboboxSeparator />
              <div className="p-1">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setCreateDialogOpen(true);
                  }}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
                >
                  <PlusIcon className="size-4" />
                  Create new tag
                </button>
              </div>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) createTagForm.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new tag</DialogTitle>
            <DialogDescription>
              Add a custom tag to this recipe.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void createTagForm.handleSubmit();
            }}
          >
            <createTagForm.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="mb-4">
                    <FieldLabel htmlFor={field.name}>Tag name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="e.g. Weekend Cooking"
                      autoFocus
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </createTagForm.Field>
            <DialogFooter>
              <Button type="submit">Create &amp; Select</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
