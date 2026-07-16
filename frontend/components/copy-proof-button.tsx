"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyProofButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return <button onClick={copy} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-3 py-2 text-[9px] font-bold text-white/65 transition hover:bg-white/10 hover:text-white">{copied ? <Check className="size-3 text-leaf-400" /> : <Copy className="size-3" />}{copied ? "Tersalin" : "Salin hash"}</button>;
}
