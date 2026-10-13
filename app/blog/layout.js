import { BarraConSesion } from "../components/NavegacionSesion";

// La cabecera la pone cada página (BlogHeader o, con sesión, AppHeader).
export default function BlogLayout({ children }) {
  return (
    <>
      {children}
      <BarraConSesion />
    </>
  );
}
