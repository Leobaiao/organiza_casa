"use client";

import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
      return;
    }

    // 2. Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 3. Listen for Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show manual instruction for iOS if not standalone
    if (isIOSDevice) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="relative group overflow-hidden bg-slate-900/50 border border-slate-800 rounded-3xl p-5 mb-8 animate-in slide-in-from-top duration-700">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Download className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-white text-base">Instalar Organiza Casa</h3>
          <p className="text-sm text-slate-400">Tenha acesso rápido e receba notificações direto no seu celular.</p>
        </div>

        <div className="shrink-0 pt-2 md:pt-0">
          {isIOS ? (
            <div className="flex items-center gap-2 text-[10px] bg-indigo-500/10 text-indigo-300 px-4 py-3 rounded-xl border border-indigo-500/20">
              <span>Toque em</span>
              <Share className="h-4 w-4" />
              <span>e depois em</span>
              <PlusSquare className="h-4 w-4" />
              <span className="font-bold uppercase tracking-tighter">Adicionar à Tela de Início</span>
            </div>
          ) : (
            <Button 
              onClick={handleInstallClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 rounded-xl"
            >
              Instalar Agora
            </Button>
          )}
        </div>
      </div>
      
      {/* Visual flare */}
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl" />
    </div>
  );
}
