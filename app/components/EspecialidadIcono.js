import {
  Baby, Bone, Brain, Bug, ChartColumn, Droplet, Droplets, Ear, Eye, FlaskConical,
  HeartPulse, HousePlus, LayoutGrid, MessageCircleHeart, Hand, Ribbon, Scale,
  ScanFace, Scissors, Siren, Stethoscope, Utensils, Venus, Wind,
} from "lucide-react";

// Icono de línea de cada especialidad. Clave: nombre en minúsculas y sin
// tildes (el de la BD). Las no listadas usan el estetoscopio. Color: en claro,
// variables del tema (accent sobre brand-light); en oscuro, el dorado de siempre.
const ICONOS = {
  cardiologia: HeartPulse,
  neurologia: Brain,
  digestivo: Utensils,
  respiratorio: Wind,
  infecciosas: Bug,
  oncologia: Ribbon,
  urgencias: Siren,
  pediatria: Baby,
  endocrinologia: FlaskConical,
  ginecologia: Venus,
  bioestadistica: ChartColumn,
  nefrologia: Droplets,
  hematologia: Droplet,
  traumatologia: Bone,
  reumatologia: Hand,
  psiquiatria: MessageCircleHeart,
  cirugia: Scissors,
  miscelanea: LayoutGrid,
  dermatologia: ScanFace,
  orl: Ear,
  mfyc: HousePlus,
  "etica medica": Scale,
  oftalmologia: Eye,
};

const clave = (n) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export default function EspecialidadIcono({ nombre }) {
  const Icono = ICONOS[clave(nombre)] || Stethoscope;
  return (
    <span className="mb-2.5 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-accent/30 bg-brand-light text-accent dark:border-transparent dark:bg-[rgba(232,184,74,.12)] dark:text-[#e8b84a]" aria-hidden="true">
      <Icono size={28} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </span>
  );
}
