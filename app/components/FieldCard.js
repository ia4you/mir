export default function FieldCard({ label, children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-card p-4 shadow-sm ${className}`}>
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-muted">{label}</p>
      {children}
    </div>
  );
}
