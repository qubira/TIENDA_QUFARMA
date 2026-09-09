import { Loader2 } from "lucide-react";

export default function LoadingScreen({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
