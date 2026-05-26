import {
  Stamp,
  Zap,
  Crosshair,
  ScanLine,
  ShieldCheck,
  FlaskConical,
  Target,
  Sparkles,
  FileCheck2,
  Boxes,
  Gauge,
  Layers,
  Network,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Stamp,
  Zap,
  Crosshair,
  ScanLine,
  ShieldCheck,
  FlaskConical,
  Target,
  Sparkles,
  FileCheck2,
  Boxes,
  Gauge,
  Layers,
  Network,
};

export function Icon({
  name,
  size = 22,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const C = MAP[name] ?? Boxes;
  return <C size={size} className={className} />;
}
