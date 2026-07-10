export default function Chip({ activo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 flex-1 rounded-xl px-1 text-xs font-bold leading-tight transition-colors sm:text-sm ${
        activo ? "bg-brand text-white" : "border border-track bg-white text-ink"
      }`}
    >
      {children}
    </button>
  );
}
