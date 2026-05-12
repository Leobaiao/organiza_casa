"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={copy}
      className="border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white"
    >
      {copied ? <Check className="h-4 w-4 mr-2 text-emerald-400" /> : <Copy className="h-4 w-4 mr-2" />}
      {copied ? "Copiado!" : "Copiar ID"}
    </Button>
  );
}
