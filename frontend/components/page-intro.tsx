import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageIntro({ eyebrow, title, description, action }: PageIntroProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-forest-950/10 pb-7 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="text-[clamp(2rem,5vw,4.75rem)] font-black leading-[.94] tracking-[-.055em] text-forest-950">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-600 md:text-base">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
