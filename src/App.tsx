import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AcompanharPedido from "./components/AcompanharPedido";
import GuiaConfiguracao from "./components/GuiaConfiguracao";
import AdminPanel from "./components/AdminPanel";
import { Pedido } from "./types";
import { 
  ClipboardList, Database, Wrench, Loader2, AlertCircle 
} from "lucide-react";

export default function App() {
  // Estados da Aplicação
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [activeTab, setActiveTab] = useState<"acompanhar" | "config" | "admin">("acompanhar");

  // Estados de Configuração e Erros do Servidor
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [dbSource, setDbSource] = useState("local");
  const [instructionSQL, setInstructionSQL] = useState("");
  const [dbError, setDbError] = useState<string | null>(null);
  const [loadingPedidos, setLoadingPedidos] = useState(true);

  // Carregar configurações do banco e lista de pedidos
  const fetchConfigAndPedidos = async () => {
    try {
      // 1. Carregar Config
      const configRes = await fetch("/api/config");
      if (configRes.ok) {
        const configData = await configRes.json();
        setSupabaseConfigured(configData.supabaseConfigured);
        setInstructionSQL(configData.instructionSQL || "");
      }

      // 2. Carregar Pedidos
      const pedidosRes = await fetch("/api/pedidos");
      if (pedidosRes.ok) {
        const pedidosData = await pedidosRes.json();
        setPedidos(pedidosData.pedidos || []);
        setDbSource(pedidosData.source || "local");
        setDbError(pedidosData.dbError || null);

        // Pré-selecionar o primeiro pedido se houver algum
        if (pedidosData.pedidos && pedidosData.pedidos.length > 0 && !pedidoSelecionado) {
          setPedidoSelecionado(pedidosData.pedidos[0]);
        }
      }
    } catch (err) {
      console.error("Falha ao carregar as informações do servidor:", err);
      setDbError("Não foi possível conectar-se ao servidor de retaguarda.");
    } finally {
      setLoadingPedidos(false);
    }
  };

  useEffect(() => {
    fetchConfigAndPedidos();
  }, []);

  // Handler para quando um pedido é adicionado no form
  const handlePedidoCriado = (novoPedido: Pedido) => {
    // Atualizar lista local
    setPedidos((prev) => [novoPedido, ...prev]);
    setPedidoSelecionado(novoPedido);
    // Transitar automaticamente para acompanhar & selecionar o novo pedido
    setActiveTab("acompanhar");
  };

  // Handler para atualização de status administrativo
  const handlePedidoStatusAtualizado = (pedidoAtualizado: Pedido) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedidoAtualizado.id ? pedidoAtualizado : p))
    );
    if (pedidoSelecionado && pedidoSelecionado.id === pedidoAtualizado.id) {
      setPedidoSelecionado(pedidoAtualizado);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none antialiased">
      {/* Barra de Navegação */}
      <Navbar 
        supabaseConfigured={supabaseConfigured} 
        hasDbError={!!dbError} 
        dbSource={dbSource} 
      />

      {/* Stark Minimalism Hero Block & Dynamic Stats Grid */}
      <div className="bg-white border-b border-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                Sincronismo via Supabase Cloud
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#1a1a1a] font-sans">
                Gerenciamento de Encomendas
              </h2>
              <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                Simulação de produção e rastreamento em tempo real de artigos esportivos e peças confeccionadas.
              </p>
            </div>
          </div>

          {/* Dynamic Summary Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Total de Pedidos</span>
              <div className="text-2xl font-light mt-1 text-[#1a1a1a]">{pedidos.length}</div>
            </div>
            <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Novos (Hoje)</span>
              <div className="text-2xl font-light mt-1 text-black font-semibold">
                +{pedidos.filter(p => new Date(p.created_at).getTime() > Date.now() - 24 * 3600000).length}
              </div>
            </div>
            <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Ticket Médio</span>
              <div className="text-2xl font-light mt-1 text-[#1a1a1a]">R$ 185</div>
            </div>
            <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Processamento</span>
              <div className="text-2xl font-light mt-1 text-[#1a1a1a]">0.8 dias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal do Dashboard */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mostrar Erro de Configuração se houver */}
        {dbError && (
          <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3 text-slate-800 shadow-xs">
            <AlertCircle className="h-5 w-5 text-slate-900 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Aviso de Configuração de Banco</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Suas credenciais do Supabase não foram preenchidas no painel de segredos do AI Studio ou a tabela <code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-black">pedidos</code> ainda não existe. O painel está em <span className="font-bold text-black">Modo de Memória Local</span>. Vá em &quot;Supabase & Banco&quot; para conectar o banco definitivo.
              </p>
            </div>
          </div>
        )}

        {/* Menu de Abas */}
        <div className="flex flex-wrap border-b border-slate-100 gap-1 mb-8">
          <button
            onClick={() => setActiveTab("acompanhar")}
            className={`flex items-center space-x-2 py-3 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer uppercase tracking-wider ${
              activeTab === "acompanhar"
                ? "border-black text-black"
                : "border-transparent text-slate-400 hover:text-black"
            }`}
          >
            <ClipboardList className="h-4.5 w-4.5" />
            <span>Acompanhar Pedidos</span>
            {pedidos.length > 0 && (
              <span className="bg-slate-100 text-[#1a1a1a] text-[10px] px-2 py-0.5 rounded font-extrabold ml-1.5 border border-slate-200/50">
                {pedidos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center space-x-2 py-3 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer uppercase tracking-wider ${
              activeTab === "admin"
                ? "border-black text-black"
                : "border-transparent text-slate-400 hover:text-black"
            }`}
          >
            <Wrench className="h-4.5 w-4.5" />
            <span>Simulador Admin</span>
          </button>

          <button
            onClick={() => setActiveTab("config")}
            className={`flex items-center space-x-2 py-3 px-6 text-xs font-bold border-b-2 transition-all cursor-pointer uppercase tracking-wider ${
              activeTab === "config"
                ? "border-black text-black"
                : "border-transparent text-slate-400 hover:text-black"
            }`}
          >
            <Database className="h-4.5 w-4.5" />
            <span>Supabase & Banco</span>
          </button>
        </div>

        {/* Visualizador de Abas */}
        <div>
          {loadingPedidos ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-slate-500 text-sm font-semibold">Carregando painel de confecções...</p>
            </div>
          ) : (
            <div>
              {activeTab === "acompanhar" && (
                <AcompanharPedido
                  pedidos={pedidos}
                  onSelecionarPedido={setPedidoSelecionado}
                  pedidoSelecionado={pedidoSelecionado}
                />
              )}

              {activeTab === "admin" && (
                <AdminPanel
                  pedidos={pedidos}
                  onPedidoStatusAtualizado={handlePedidoStatusAtualizado}
                />
              )}

              {activeTab === "config" && (
                <div className="max-w-3xl mx-auto">
                  <GuiaConfiguracao
                    supabaseConfigured={supabaseConfigured}
                    instructionSQL={instructionSQL}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Sticky High-Contrast Status Footer */}
      <footer className="bg-black text-slate-400 py-4 px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold tracking-widest uppercase gap-2.5 mt-12 flex-shrink-0">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Sincronização: Tempo Real
          </span>
          <span>DB: Supabase (PostgreSQL)</span>
        </div>
        <div className="text-slate-500">© 2026 ORDERFLOW V1.0.4 • BR</div>
      </footer>
    </div>
  );
}
