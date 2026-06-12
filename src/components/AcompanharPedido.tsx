import { useState } from "react";
import { Pedido } from "../types";
import { 
  ClipboardList, Search, Eye, Calendar, MapPin, 
  User, CheckCircle2, Clock, Truck, Box, Smartphone, Mail, ChevronRight, X
} from "lucide-react";

interface AcompanharPedidoProps {
  pedidos: Pedido[];
  onSelecionarPedido: (pedido: Pedido) => void;
  pedidoSelecionado: Pedido | null;
}

export default function AcompanharPedido({ pedidos, onSelecionarPedido, pedidoSelecionado }: AcompanharPedidoProps) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    const termoBusca = busca.toLowerCase();
    const matchesBusca = 
      p.nome.toLowerCase().includes(termoBusca) ||
      p.email.toLowerCase().includes(termoBusca) ||
      p.pedido.toLowerCase().includes(termoBusca) ||
      p.cep.includes(termoBusca);
    
    const matchesStatus = filtroStatus === "todos" || p.status === filtroStatus;

    return matchesBusca && matchesStatus;
  });

  // Obter cores para as pílulas de status
  const getStatusBadge = (status: Pedido["status"]) => {
    switch (status) {
      case "Pendente":
        return "bg-slate-50 text-slate-550 border-slate-100";
      case "Processando":
        return "bg-amber-50/40 text-amber-700 border-amber-100/60";
      case "Enviado":
        return "bg-blue-50/40 text-blue-600 border-blue-100/60";
      case "Entregue":
        return "bg-emerald-50/40 text-emerald-700 border-emerald-100/60";
      default:
        return "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  // Funções helper para o Stepper Tracker
  const statusSteps = [
    { name: "Pendente", label: "Recebido", desc: "Aguardando processamento", icon: Clock },
    { name: "Processando", label: "Em Separação", desc: "Estoque e embalagem", icon: Box },
    { name: "Enviado", label: "Enviado", desc: "A caminho com transportadora", icon: Truck },
    { name: "Entregue", label: "Entregue", desc: "Entregue no endereço", icon: CheckCircle2 }
  ];

  const getStepIndex = (status: Pedido["status"]) => {
    return statusSteps.findIndex((step) => step.name === status);
  };

  const selectedIndex = pedidoSelecionado ? getStepIndex(pedidoSelecionado.status) : -1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Lista de Pedidos */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 lg:col-span-7">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <ClipboardList className="h-4.5 w-4.5 text-black" />
            <span>Pedidos de Confecção</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Selecione uma encomenda para acompanhar a linha de produção em tempo real.
          </p>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-grow">
            <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450 h-3 w-3 my-auto" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cliente, e-mail ou item..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-xs font-medium placeholder-slate-400 transition-all"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none text-xs text-slate-600 font-bold cursor-pointer"
          >
            <option value="todos">Todos Status</option>
            <option value="Pendente">Pendentes</option>
            <option value="Processando">Em Separação</option>
            <option value="Enviado">Enviados</option>
            <option value="Entregue">Entregues</option>
          </select>
        </div>

        {/* Tabela/Lista */}
        <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
          {pedidosFiltrados.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200/60 rounded-2xl">
              <ClipboardList className="h-8 w-8 text-slate-350 mx-auto mb-2.5" />
              <p className="text-xs font-bold text-slate-600">Nenhum pedido localizado</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Crie novas confecções ou modifique os filtros de busca.</p>
            </div>
          ) : (
            pedidosFiltrados.map((pedido) => (
              <div
                key={pedido.id}
                onClick={() => onSelecionarPedido(pedido)}
                className={`p-4 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                  pedidoSelecionado?.id === pedido.id
                    ? "bg-slate-50 border-black shadow-xs"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/40"
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                  <div className="h-9 w-9 flex-shrink-0 rounded-full bg-slate-100/70 border border-slate-200/40 flex items-center justify-center text-slate-750 font-extrabold text-xs">
                    {pedido.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="font-bold text-slate-800 text-xs truncate">
                      {pedido.nome}
                    </h4>
                    <p className="text-xs text-black font-extrabold truncate mt-0.5">
                      {pedido.pedido}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400">
                      <span className="flex items-center font-medium">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(pedido.created_at).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 flex-shrink-0">
                  <span className={`text-[9px] px-2.5 py-1 rounded-full border font-extrabold uppercase tracking-wider ${getStatusBadge(pedido.status)}`}>
                    {pedido.status === "Processando" ? "Separando" : pedido.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rastreamento do Pedido Selecionado */}
      <div className="lg:col-span-5 space-y-6">
        {pedidoSelecionado ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-5">
            {/* Header com Opção de Fechar */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 text-left">
              <div>
                <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest leading-none">
                  Identificador
                </span>
                <h3 className="font-mono text-xs font-bold text-black mt-1 uppercase">
                  #{pedidoSelecionado.id.slice(0, 8)}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 text-right leading-relaxed">
                Emissão: <br />
                <span className="font-bold text-slate-700">
                  {new Date(pedidoSelecionado.created_at).toLocaleDateString("pt-BR")}
                </span>
              </p>
            </div>

            {/* Dados do Cliente */}
            <div className="space-y-2 bg-slate-50/60 p-4 rounded-xl border border-slate-100/40 text-left">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <User className="h-3 w-3 mr-1 text-slate-500" />
                <span>Destinatário & Rota</span>
              </h4>
              <div className="grid grid-cols-1 gap-2 text-xs text-slate-650 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Nome:</span>
                  <span className="font-bold text-slate-800 text-right">{pedidoSelecionado.nome}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">E-mail:</span>
                  <span className="font-semibold text-slate-700 text-right truncate max-w-[170px]">{pedidoSelecionado.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">WhatsApp:</span>
                  <span className="font-medium text-slate-700 text-right">{pedidoSelecionado.telefone}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-slate-400 font-medium">CEP de Entrega:</span>
                  <span className="font-bold text-black text-right">{pedidoSelecionado.cep}</span>
                </div>
              </div>
            </div>

            {/* Produto Comprado */}
            <div className="text-left">
              <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest block">
                Item Solicitado
              </span>
              <div className="mt-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">
                    {pedidoSelecionado.pedido}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Dispositivo Premium</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-black bg-white px-2 py-1 rounded-md border border-slate-200">
                    Qtd: 1 un
                  </span>
                </div>
              </div>
            </div>

            {/* Linha do Tempo e Stepper Progress */}
            <div className="text-left pt-1">
              <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest block mb-4">
                Histórico da Esteira de Produção
              </span>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx <= selectedIndex;
                  const isCurrent = idx === selectedIndex;

                  return (
                    <div key={step.name} className="relative flex items-start space-x-3">
                      {/* Círculo do Status */}
                      <span
                        className={`absolute -left-6 flex-shrink-0 h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                          isCurrent
                            ? "bg-black border-black scale-105 shadow-xs"
                            : isCompleted
                            ? "bg-slate-200 border-slate-300"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        {isCompleted && !isCurrent && (
                          <div className="h-1 w-1 rounded-full bg-slate-800" />
                        )}
                        {isCurrent && (
                          <div className="h-1 w-1 rounded-full bg-white animate-ping" />
                        )}
                      </span>

                      {/* Descrição do Status */}
                      <div className="text-xs">
                        <h4
                          className={`font-semibold ${
                            isCurrent
                              ? "text-black text-[12.5px]"
                              : isCompleted
                              ? "text-slate-800 font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p
                          className={`text-[10.5px] mt-0.5 leading-relaxed ${
                            isCurrent
                              ? "text-slate-500 font-medium"
                              : isCompleted
                              ? "text-slate-400"
                              : "text-slate-400"
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/70 border border-slate-200/80 border-dashed rounded-3xl p-8 text-center text-slate-400">
            <Truck className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <span className="font-bold text-slate-600 text-xs block uppercase tracking-wider">Acompanhamento</span>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
              Clique em alguma encomenda para carregar a ficha de produção e detalhes do ciclo logístico.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

