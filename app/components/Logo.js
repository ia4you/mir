export default function Logo({ className = "h-10 w-auto" }) {
  return (
    <svg width="100%" viewBox="0 0 680 200" role="img" className={className}>
      <title>Logo MIR Turel</title>
      <desc>Logo de MIR Turel con icono médico y texto</desc>
      <style>{`
        .logo-bg { fill: #00878E; }
        .logo-pulse { fill: none; stroke: white; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
        .logo-title { font-family: inherit; font-size: 42px; font-weight: 500; fill: #00878E; }
        .logo-sub { font-family: inherit; font-size: 16px; font-weight: 400; fill: #00878E; letter-spacing: 3px; }
        @media (prefers-color-scheme: dark) {
          .logo-title { fill: #2DD4D9; }
          .logo-sub { fill: #2DD4D9; }
        }
      `}</style>
      <rect x="40" y="40" width="120" height="120" rx="24" className="logo-bg" />
      <rect x="85" y="62" width="30" height="76" rx="6" fill="white" opacity="0.25" />
      <rect x="62" y="85" width="76" height="30" rx="6" fill="white" opacity="0.25" />
      <polyline
        className="logo-pulse"
        points="62,100 78,100 84,78 92,122 100,88 108,108 116,100 138,100"
      />
      <text x="185" y="110" className="logo-title">MIR</text>
      <text x="185" y="145" className="logo-sub">TUREL</text>
      <line x1="185" y1="120" x2="340" y2="120" stroke="#00878E" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}
