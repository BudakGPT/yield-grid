import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <main className="site-container grid min-h-[70vh] place-items-center py-16 text-center">
      <div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-forest-950 text-leaf-400"><Sprout className="size-7" /></span><p className="eyebrow mt-7">404 · plot not found</p><h1 className="mt-3 text-5xl font-black tracking-[-.06em] text-forest-950">Lahannya belum ditanami.</h1><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink-600">Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.</p><Link href="/" className="primary-button mt-7"><ArrowLeft className="size-4" /> Kembali ke beranda</Link></div>
    </main>
  );
}
