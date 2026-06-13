"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation } from "convex/react";
import { PlusIcon } from "lucide-react";
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
      <div className="border-border mx-6 my-4 rounded-xl border p-4">
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
          Tags
        </p>
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
