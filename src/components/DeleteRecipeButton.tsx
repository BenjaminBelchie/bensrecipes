"use client";

import { useState } from "react";
import { useOnlineMutation } from "~/hooks/use-online-mutation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { type Id } from "~/convex/_generated/dataModel";
import { api } from "~/convex/_generated/api";
import { useOnline } from "~/hooks/use-online";
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
  const online = useOnline();
  const removeRecipe = useOnlineMutation(api.recipes.remove);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    if (!navigator.onLine) {
      toast.error("Deleting recipes requires a connection.");
      return;
    }
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
        <Button
          variant="destructive"
          size="xs"
          disabled={isPending || !online}
          aria-label="Delete"
        >
          <Trash2 />
          <span className="hidden md:inline">Delete</span>
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
