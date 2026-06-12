import { useState } from "react";
import { Terminal, Copy, Check, Info, Database } from "lucide-react";

interface GuiaConfiguracaoProps {
  supabaseConfigured: boolean;
  instructionSQL: string;
}

export default function GuiaConfiguracao({ supabaseConfigured, instructionSQL }: GuiaConfiguracaoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(instructionSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8">
      <div className="flex items-start space-x-3.5 mb-6 text-left">
        <div className="p-2.5 bg-slate-50 text-black border border-slate-100 rounded-xl">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Integração Supabase</h3>
          <p className="text-xs text-slate-400 mt-1">
            Persistência segura de ponta a ponta na nuvem conectando o seu banco de dados PostgreSQL.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-left">
        {/* Passo 1 */}
        <div className="flex space-x-3">
          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-50 border border-slate-150 text-slate-700 text-xs font-bold flex items-center justify-center">
            1
          </span>
          <div className="text-xs">
            <span className="font-bold text-slate-700">Configure as chaves do Supabase:</span>
            <p className="text-slate-450 mt-1">
              Acesse as configurações do seu workspace no painel de segredos do AI Studio e defina as variáveis:
            </p>
            <div className="mt-2.5 text-[11px] font-mono bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-600 space-y-1 leading-relaxed">
              <div>SUPABASE_URL = &quot;https://xxxxxx.supabase.co&quot;</div>
              <div>SUPABASE_ANON_KEY = &quot;eyJhbGciOi...&quot;</div>
            </div>
          </div>
        </div>

        {/* Passo 2 */}
        <div className="flex space-x-3">
          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-50 border border-slate-150 text-slate-700 text-xs font-bold flex items-center justify-center">
            2
          </span>
          <div className="text-xs flex-grow">
            <span className="font-bold text-slate-700">Crie a Tabela de Pedidos no Banco de Dados:</span>
            <p className="text-slate-450 mt-1 mb-3">
              Abra o console do Supabase &rarr; clique em SQL Editor &rarr; clique em New Query, cole e execute:
            </p>

            <div className="relative mt-2 rounded-xl border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center space-x-1.5 font-bold uppercase tracking-wider">
                  <Terminal className="h-3 w-3 text-slate-450" />
                  <span>schema_pedidos.sql</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center space-x-1 hover:text-black transition-colors focus:outline-none font-bold uppercase tracking-wider cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-700">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-black text-slate-300 text-[11px] font-mono overflow-x-auto max-h-[160px] leading-relaxed select-all">
                {instructionSQL}
              </pre>
            </div>
          </div>
        </div>

        {/* Informação sobre fallback */}
        <div className="mt-2 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-start space-x-2.5">
          <Info className="h-4.5 w-4.5 text-black mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-800">Dica:</span> Enquanto você não configura o Supabase no painel, a aplicação opera no <span className="font-bold text-black">Modo Demo Local</span> em memória, de forma plenamente funcional para fins de testes.
          </p>
        </div>
      </div>
    </div>
  );
}

