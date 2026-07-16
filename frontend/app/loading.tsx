export default function Loading() {
  return (
    <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8">
      <div className="h-4 w-32 animate-pulse rounded-full bg-forest-900/10" />
      <div className="mt-5 h-12 max-w-xl animate-pulse rounded-2xl bg-forest-900/10" />
      <div className="mt-8 h-[420px] animate-pulse rounded-[2rem] bg-forest-900/10" />
    </div>
  );
}
