import { Database, Radio, AlertTriangle } from "lucide-react";

interface NavbarProps {
  supabaseConfigured: boolean;
  hasDbError: boolean;
  dbSource: string;
}


export default function Navbar({ supabaseConfigured, hasDbError, dbSource }: NavbarProps) {
  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50">
      {/* Logo Group */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center transition-transform hover:scale-105">
            <div className="w-3.5 h-3.5 bg-white rounded-sm"></div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="font-extrabold tracking-tight text-lg text-black font-sans uppercase">
              ORDERFLOW
            </span>
            <span className="text-xs text-slate-400 font-medium font-sans">
              • Painel de Pedidos
            </span>
          </div>
        </div>
      </div>

      {/* Database/API Sync Indicator with Clean Minimalism Colors */}
      <div className="flex items-center gap-3">
        {supabaseConfigured ? (
          hasDbError ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-100">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="hidden sm:inline">Supabase (Tabela pendente)</span>
              <span className="sm:hidden">Tabela Erro</span>
            </div>
          ) : dbSource === "supabase" ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Supabase Connected
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
              <Radio className="h-3 w-3 animate-pulse text-blue-500" />
              <span>Modo Local Fallback</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-100">
            <Database className="h-3 w-3 text-slate-400" />
            <span>Memória Local (Demo)</span>
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800">
          U
        </div>
      </div>
    </header>
  );
}

