"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

import { usePwa } from "@/hooks/use-pwa";
import { Button } from "@/components/ui/button";

export function PwaRegister() {
  const [swReady, setSwReady] = useState(false);
  const { canInstall, install, isInstalled } = usePwa();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register("/sw.js")
      .then(() => setSwReady(true))
      .catch(() => {
        /* preview/iframes ou política do browser — não deve derrubar a página */
      });
  }, []);

  if (isInstalled) return null;

  return (
    <div className="fixed left-4 top-4 z-50 max-w-sm rounded-md border border-border bg-card p-3 shadow-lg">
      <p className="text-sm font-semibold">Bidas PWA</p>
      <p className="mt-1 text-xs text-zinc-400">
        {swReady ? "Modo offline ativo." : "Ativando service worker..."}
      </p>
      {canInstall ? (
        <Button
          size="sm"
          className="mt-3 w-full"
          onClick={() => {
            void install();
          }}
        >
          <Smartphone className="mr-2 h-4 w-4" />
          Instalar no dispositivo
        </Button>
      ) : null}
    </div>
  );
}
