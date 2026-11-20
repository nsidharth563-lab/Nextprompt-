export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl py-8 text-[15px] leading-relaxed text-white/75 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-6 [&_p]:mt-3">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="text-sm text-white/45">Last updated: {updated}</p>
      {children}
    </article>
  );
}
