"use client";

import { Camera, CheckCircle2, LoaderCircle, ScanSearch, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function ScanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose]);

  const analyze = () => {
    setAnalyzing(true);
    setComplete(false);
    window.setTimeout(() => { setAnalyzing(false); setComplete(true); }, 950);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-forest-950/62 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
          <motion.div className="panel max-h-[92vh] w-full max-w-[760px] overflow-y-auto" initial={{ opacity: 0, y: 20, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ type: "spring", stiffness: 260, damping: 28 }}>
            <div className="flex items-start justify-between border-b border-black/6 p-5 sm:p-6">
              <div><span className="pill bg-leaf-100 text-forest-700"><ScanSearch className="size-3" /> Edge AI verification</span><h2 className="mt-3 text-2xl font-extrabold tracking-[-.05em]">Scan hasil panen baru</h2><p className="mt-1 text-xs text-ink-600">Prototype frontend dengan data analisis simulasi.</p></div>
              <button onClick={onClose} className="grid size-9 place-items-center rounded-xl border border-black/8 bg-cream-50" aria-label="Tutup"><X className="size-4" /></button>
            </div>
            <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[1.05fr_.95fr]">
              <label className="tomato-photo flex min-h-[300px] cursor-pointer flex-col justify-end rounded-2xl p-5 text-white"><input type="file" accept="image/*" className="sr-only" /><Camera className="mb-3 size-7" /><strong className="text-sm">Ambil atau unggah foto</strong><span className="mt-1 text-[10px] text-white/60">Gunakan kartu referensi ukuran untuk hasil terbaik.</span></label>
              <div className="space-y-3">
                <select className="w-full rounded-xl border border-black/10 bg-cream-50 px-3 py-3 text-sm"><option>Tomat</option><option>Mangga</option><option>Cabai merah</option></select>
                <input className="w-full rounded-xl border border-black/10 bg-cream-50 px-3 py-3 text-sm" defaultValue="Pangalengan, Jawa Barat" aria-label="Asal kebun" />
                <div className="grid grid-cols-2 gap-3"><input type="number" defaultValue="8" aria-label="Jumlah peti" className="rounded-xl border border-black/10 bg-cream-50 px-3 py-3 text-sm" /><input type="number" defaultValue="96" aria-label="Berat aktual" className="rounded-xl border border-black/10 bg-cream-50 px-3 py-3 text-sm" /></div>
                <div className="rounded-2xl border border-black/8 bg-cream-50 p-4">
                  {analyzing ? <div className="flex items-center gap-3 text-xs font-bold"><LoaderCircle className="size-4 animate-spin text-forest-700" /> Menganalisis sampel...</div> : complete ? <div><div className="flex items-center gap-2 text-xs font-extrabold text-forest-700"><CheckCircle2 className="size-4" /> Grade A · 91% confidence</div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px]"><span>96 kg<br /><b>Weight</b></span><span>18h<br /><b>Freshness</b></span><span>4.8%<br /><b>Defect</b></span></div></div> : <div className="text-xs font-bold text-ink-600">Belum dianalisis</div>}
                </div>
                <button onClick={analyze} className="primary-button w-full" disabled={analyzing}>{analyzing ? "Memindai..." : "Analisis dengan AI"}</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
