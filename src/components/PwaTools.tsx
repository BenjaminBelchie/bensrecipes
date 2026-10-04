"use client";

import { useEffect, useState } from "react";
import {
  Download,
  RefreshCw,
  Trash2,
  WifiOff,
  CloudCheck,
  CircleAlert,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useRecipes } from "~/components/RecipeDataProvider";
import { useOnline } from "~/hooks/use-online";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "~/components/ui/alert-dialog";

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaTools() {
  const data = useRecipes();
  const online = useOnline();
  const [prompt, setPrompt] = useState<InstallEvent>();
  const [standalone, setStandalone] = useState(true);
  const [guide, setGuide] = useState(false);
  const [shellReady, setShellReady] = useState(false);
  useEffect(() => {
    const mode = matchMedia("(display-mode: standalone)");
    const update = () =>
      setStandalone(
        mode.matches ||
          (navigator as Navigator & { standalone?: boolean }).standalone ===
            true,
      );
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallEvent);
    };
    const installed = () => {
      setStandalone(true);
      setPrompt(undefined);
    };
    update();
    mode.addEventListener("change", update);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", installed);
    if ("serviceWorker" in navigator)
      void navigator.serviceWorker.ready.then(() => setShellReady(true));
    return () => {
      mode.removeEventListener("change", update);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  const downloaded =
    data.savedAt &&
    data.progress &&
    data.progress.completed === data.progress.total &&
    data.progress.failed === 0 &&
    shellReady;
  const label =
    data.error ??
    (data.offline
      ? "Offline"
      : data.syncing
        ? `Downloading${data.progress ? ` photos ${data.progress.completed}/${data.progress.total}` : " recipes"}`
        : downloaded
          ? "Available offline"
          : data.savedAt
            ? "Recipes saved; photos incomplete"
            : "Not downloaded");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          title="Settings"
          aria-label="Settings"
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Ben&apos;s Recipes on this device.
          </DialogDescription>
        </DialogHeader>
        <section
          className="min-w-0 space-y-4"
          aria-labelledby="device-data-title"
        >
          <h2 id="device-data-title" className="font-medium">
            Data on This Device
          </h2>
          <div
            className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm"
            role="status"
          >
            {data.error ? (
              <CircleAlert className="size-4 shrink-0" />
            ) : data.offline ? (
              <WifiOff className="size-4 shrink-0" />
            ) : (
              <CloudCheck className="size-4 shrink-0" />
            )}
            <span className="min-w-0 break-words">{label}</span>
          </div>
          {data.savedAt && (
            <p className="text-muted-foreground text-xs">
              Last saved {new Date(data.savedAt).toLocaleString()}
            </p>
          )}
          {data.syncing && data.progress && data.progress.total > 0 && (
            <Progress
              className="h-1 w-full"
              value={
                ((data.progress.completed + data.progress.failed) /
                  data.progress.total) *
                100
              }
            />
          )}
          <div className="flex flex-wrap items-center gap-2">
            {data.retry && (
              <Button
                variant="outline"
                size="sm"
                title="Sync recipes"
                aria-label="Sync recipes"
                disabled={!online || data.syncing}
                onClick={() => {
                  void navigator.storage?.persist?.().catch(() => false);
                  data.retry?.();
                }}
              >
                <RefreshCw className={data.syncing ? "animate-spin" : ""} />
                Sync recipes
              </Button>
            )}
            {data.clear && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Clear saved recipes"
                    aria-label="Clear saved recipes"
                    disabled={(data.syncing ?? false) || !data.savedAt}
                  >
                    <Trash2 />
                    Clear saved recipes
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear saved recipes?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Remove offline recipes and photos from this device. Online
                      recipes are not affected.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        void data
                          .clear?.()
                          .catch(() =>
                            toast.error("Saved recipes could not be cleared."),
                          )
                      }
                    >
                      Clear
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </section>
        {!standalone && (
          <div className="border-border border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              title="Install app"
              aria-label="Install app"
              onClick={async () => {
                if (prompt) {
                  await prompt.prompt();
                  await prompt.userChoice;
                  setPrompt(undefined);
                } else setGuide(true);
              }}
            >
              <Download />
              Install app
            </Button>
          </div>
        )}
        <Dialog open={guide} onOpenChange={setGuide}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Install Ben&apos;s Recipes</DialogTitle>
              <DialogDescription>
                On iPhone or iPad, open this site in Safari, select Share, then
                Add to Home Screen. On Android, select Install app or Add to
                Home screen from your browser menu.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
