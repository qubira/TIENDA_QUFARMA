import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex h-full min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
      <Compass className="h-12 w-12 text-slate-300" />
      <h1 className="text-lg font-bold text-slate-800">Página no encontrada</h1>
      <Link to="/" className="btn-primary mt-2">
        Volver al inicio
      </Link>
    </div>
  );
}
