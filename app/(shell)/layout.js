import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";

// AppHeader y BottomNav solo se pintan en las rutas de esRutaApp (BottomNav.js);
// login, registro, test, resultados, demo y premium siguen sin ellos.
export default function ShellLayout({ children }) {
  return (
    <>
      <AppHeader />
      {/* Columna móvil (max-w-md) en todas las pantallas; desde lg, las que
          marcan su raíz con la clase "ancho-app" (y llevan lg:px-8) pasan a
          1240px de contenido, alineado con AppHeader. */}
      <div className="mx-auto min-h-screen w-full max-w-md bg-surface lg:has-[>.ancho-app]:max-w-[1304px]">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
