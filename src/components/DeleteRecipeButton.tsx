"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { type Id } from "~/convex/_generated/dataModel";
import { api } from "~/convex/_generated/api";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

interface DeleteRecipeButtonProps {
  id: Id<"recipes">;
  title: string;
}

export function DeleteRecipeButton({ id, title }: DeleteRecipeButtonProps) {
  const removeRecipe = useMutation(api.recipes.remove);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    try {
      await removeRecipe({ id });
      toast.success("Recipe deleted.");
    } catch {
      toast.error("Failed to delete recipe.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="xs" disabled={isPending}>
          <Trash2 />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{title}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone. The recipe will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => void handleDelete()}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
