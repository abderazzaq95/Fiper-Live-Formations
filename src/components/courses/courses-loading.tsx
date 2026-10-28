export function CoursesLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-[#f3f6f7]">
      <div className="h-20 bg-[#031a2d]" />
      <div className="bg-[#031a2d] px-5 py-24 sm:px-8"><div className="mx-auto max-w-[1280px]"><div className="h-5 w-48 rounded bg-white/10" /><div className="mt-6 h-14 max-w-2xl rounded bg-white/10" /><div className="mt-4 h-5 max-w-xl rounded bg-white/10" /></div></div>
      <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8"><div className="h-10 w-72 rounded bg-[#dce4e8]" /><div className="mt-10 grid gap-6 md:grid-cols-2">{[0, 1].map((item) => <div key={item} className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#e0e7eb]"><div className="aspect-[16/9] bg-[#dce4e8]" /><div className="p-6"><div className="h-5 w-2/3 rounded bg-[#e6ebee]" /><div className="mt-4 h-8 rounded bg-[#e6ebee]" /><div className="mt-3 h-16 rounded bg-[#eef2f4]" /></div></div>)}</div></div>
    </main>
  );
}
