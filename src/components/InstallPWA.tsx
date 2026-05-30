"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Share2, PlusSquare, ArrowUpToLine, Smartphone, Check } from "lucide-react";

export function InstallPWA() {
  const [mounted, setMounted] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showOthersModal, setShowOthersModal] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Register service worker if supported
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registrado com sucesso:", reg.scope))
        .catch((err) => console.error("Erro ao registrar Service Worker:", err));
    }

    // Check if running in standalone (installed) mode
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
      const isIOSStandalone = (navigator as any).standalone === true;
      setIsStandalone(isStandaloneMedia || isIOSStandalone);
    };

    // Detect iOS
    const detectIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
      setIsIOS(isIOSDevice);
    };

    checkStandalone();
    detectIOS();

    // Listen to beforeinstallprompt event (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Also check when media query changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      }
    };
  }, []);

  if (!mounted || isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Resultado da instalação: ${outcome}`);
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      // Browser doesn't support or haven't fired beforeinstallprompt yet
      setShowOthersModal(true);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-6 backdrop-blur-md sm:flex-row sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Instalar Aplicativo</h3>
            <p className="text-sm text-slate-400">
              Tenha o Organiza Casa direto na sua tela inicial para acesso rápido e envio fácil de comprovantes.
            </p>
          </div>
        </div>
        <Button
          onClick={handleInstallClick}
          className="w-full shrink-0 bg-indigo-600 font-medium text-white hover:bg-indigo-500 sm:w-auto px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200"
        >
          <Download className="mr-2 h-4 w-4" />
          Instalar App
        </Button>
      </div>

      {/* Modal de Instalação para iOS (iPhone) */}
      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
              <Smartphone className="h-5 w-5 text-indigo-400" />
              Instalar no iPhone
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Siga os passos rápidos abaixo para adicionar o app à sua tela de início usando o Safari:
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-indigo-400 border border-slate-700">
                1
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200">
                  Toque no botão de <span className="text-white font-semibold">Compartilhar</span>
                </p>
                <p className="text-xs text-slate-400">
                  Fica na barra de navegação inferior do Safari (ícone de um quadrado com uma seta para cima).
                </p>
                <div className="mt-2 flex items-center justify-center rounded-lg bg-slate-950 p-2.5 w-fit border border-slate-800">
                  {/* Custom Safari Share Icon */}
                  <svg
                    className="h-6 w-6 text-indigo-400 animate-pulse"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="5" y="9" width="14" height="11" rx="2" />
                    <path d="M12 15V3m0 0L8.5 6.5M12 3l3.5 3.5" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-indigo-400 border border-slate-700">
                2
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200">
                  Role a lista e selecione <span className="text-white font-semibold">Adicionar à Tela de Início</span>
                </p>
                <p className="text-xs text-slate-400">
                  Pode ser necessário rolar um pouco para baixo nas opções de compartilhamento.
                </p>
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 w-fit border border-slate-800">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-slate-300">
                    <PlusSquare className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-300">Adicionar à Tela de Início</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-indigo-400 border border-slate-700">
                3
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200">
                  Confirme tocando em <span className="text-white font-semibold">Adicionar</span>
                </p>
                <p className="text-xs text-slate-400">
                  O aplicativo será criado com o ícone original na sua tela inicial!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setShowIOSModal(false)}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Instalação para Outros Navegadores (quando prompt indisponível) */}
      <Dialog open={showOthersModal} onOpenChange={setShowOthersModal}>
        <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
              <Smartphone className="h-5 w-5 text-indigo-400" />
              Como instalar o App
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Parece que o seu navegador não suporta a instalação direta automática. Siga estas instruções manuais:
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-300">
              Para instalar este aplicativo no seu dispositivo:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-300 space-y-2">
              <li>
                Abra o menu de configurações do navegador (normalmente os <span className="text-white font-semibold">três pontos</span> no canto superior direito do Chrome, ou o ícone do menu no Firefox).
              </li>
              <li>
                Procure por uma opção como <span className="text-white font-semibold">"Instalar aplicativo"</span> ou <span className="text-white font-semibold">"Adicionar à tela inicial"</span>.
              </li>
              <li>
                Siga as etapas na tela para confirmar.
              </li>
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setShowOthersModal(false)}
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
