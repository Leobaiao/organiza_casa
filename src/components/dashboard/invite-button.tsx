"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Copy } from "lucide-react";

export function InviteButton({ householdId }: { householdId: string }) {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // Get the base URL only on the client side
    setBaseUrl(window.location.origin);
  }, []);

  const inviteUrl = `${baseUrl}/signup?invite=${householdId}`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Convite para Organiza Casa",
          text: "Junte-se à nossa casa no Organiza Casa para gerenciar nossas contas!",
          url: inviteUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
        copyInvite();
      }
    } else {
      copyInvite();
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        onClick={shareInvite}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-bold h-12 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
      >
        <Share2 className="h-4 w-4" />
        Convidar via WhatsApp
      </Button>
      
      <Button 
        variant="outline" 
        onClick={copyInvite}
        className={`w-full border-slate-800 bg-slate-900/50 text-slate-300 gap-2 h-10 rounded-xl transition-all ${
          copied ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" : "hover:bg-slate-800"
        }`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Link Copiado!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copiar Link Direto
          </>
        )}
      </Button>
    </div>
  );
}
