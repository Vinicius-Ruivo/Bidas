"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function usePwa() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(standalone || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setCanInstall(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
      return true;
    }
    return false;
  }

  return { canInstall, install, isInstalled };
}
