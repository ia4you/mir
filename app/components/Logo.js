// Logo de texto: "mir" claro, ".turel" dorado en cursiva, ".es" gris, en
// Instrument Serif. text-accent y no el dorado de relleno: en tema claro el
// #E3B95C no llega a 4,5:1 sobre fondo claro.
export default function Logo({ className = "text-3xl" }) {
  return (
    <span className={`font-serif leading-none tracking-tight text-ink ${className}`}>
      mir<span className="italic text-accent">.turel</span>
      <span className="text-ink-subtle">.es</span>
    </span>
  );
}
