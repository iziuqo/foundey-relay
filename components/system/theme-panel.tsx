export function ThemePanel({ theme, children }: { theme: "light" | "dark"; children: React.ReactNode }) {
  return (
    <div data-theme={theme} className="rounded-(--radius-control) border border-(--border-1) bg-(--bg) p-4">
      <p className="mb-3 text-(length:--text-kbd) font-semibold tracking-wide text-(--text-2) uppercase">{theme}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
