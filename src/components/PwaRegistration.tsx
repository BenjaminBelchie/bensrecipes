"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { isPublicRecipePath } from "~/lib/pwa-routes";

export function PwaRegistration() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    let disposed = false;
    let accepted = false;
    let registration: ServiceWorkerRegistration | undefined;
    const offerUpdate = () => {
      if (
        !disposed &&
        navigator.serviceWorker.controller &&
        registration?.waiting
      )
        setWaiting(registration.waiting);
    };
    const onControllerChange = () => {
      if (accepted) window.location.reload();
    };
    const onUpdateFound = () =>
      registration?.installing?.addEventListener("statechange", offerUpdate);
    const onClick = (event: MouseEvent) => {
      if (
        navigator.onLine ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>("a[href]")
          : null;
      if (!target || target.target || target.hasAttribute("download")) return;
      const url = new URL(target.href);
      if (url.origin === location.origin && isPublicRecipePath(url.pathname)) {
        event.preventDefault();
        event.stopPropagation();
        window.location.assign(url.href);
      }
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    document.addEventListener("click", onClick, true);
    void navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((result) => {
        registration = result;
        if (disposed) return;
        offerUpdate();
        registration.addEventListener("updatefound", onUpdateFound);
      })
      .catch(() => undefined);
    const onAccept = () => {
      accepted = true;
    };
    window.addEventListener("pwa-accept-update", onAccept);
    return () => {
      disposed = true;
      registration?.removeEventListener("updatefound", onUpdateFound);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pwa-accept-update", onAccept);
    };
  }, []);
  if (!waiting) return null;
  return (
    <div
      className="bg-background border-border fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg border p-3 shadow-sm"
      role="status"
    >
      <span className="text-sm">Update available</span>
      <Button
        size="sm"
        onClick={() => {
          window.dispatchEvent(new Event("pwa-accept-update"));
          waiting.postMessage({ type: "SKIP_WAITING" });
        }}
      >
        <RefreshCw />
        Update
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setWaiting(null)}>
        Later
      </Button>
    </div>
  );
}
