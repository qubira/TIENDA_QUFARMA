import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export default function SinPermisoPage() {
  return (
    <div className="flex h-full min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
      <ShieldAlert className="h-12 w-12 text-amber-500" />
      <h1 className="text-lg font-bold text-slate-800">Sin permiso</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Tu usuario no tiene acceso a este módulo. Si crees que es un error, contacta a un
        administrador.
      </p>
      <Link to="/" className="btn-primary mt-2">
        Volver al inicio
      </Link>
    </div>
  );
}
