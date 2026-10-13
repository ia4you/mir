import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";

// AppHeader y BottomNav solo se pintan en las rutas de esRutaApp (BottomNav.js);
// login, registro, test, resultados, demo y premium siguen sin ellos.
export default function ShellLayout({ children }) {
  return (
    <>
      <AppHeader />
      <div className="mx-auto min-h-screen w-full max-w-md bg-surface">{children}</div>
      <BottomNav />
    </>
  );
}
