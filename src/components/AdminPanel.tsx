import { useState } from "react";
import { Pedido } from "../types";
import { 
  Wrench, Clock, Box, Truck, CheckCircle2, Loader2 
} from "lucide-react";

interface AdminPanelProps {
  pedidos: Pedido[];
  onPedidoStatusAtualizado: (pedidoAtualizado: Pedido) => void;
  onLimparDados?: () => void;
}

export default function AdminPanel({ pedidos, onPedidoStatusAtualizado }: AdminPanelProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, novoStatus: Pedido["status"]) => {
    setLoadingId(id);
    try {
      const response = await fetch(`/api/pedidos/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus })
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar o status do pedido");
      }

      const data = await response.json();
      onPedidoStatusAtualizado(data.pedido);
    } catch (err) {
      console.error("Erro na atualização administrativa de status:", err);
      alert("Erro ao comunicar com o servidor de pedidos.");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusButtonClass = (statusAtual: Pedido["status"], itemStatus: string) => {
    if (statusAtual === itemStatus) {
      return "bg-black text-white font-bold pointer-events-none";
    }
    return "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 hover:border-slate-200";
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8">
      <div className="mb-6 flex items-start justify-between text-left">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <Wrench className="h-4.5 w-4.5 text-black" />
            <span>Simulador Administrativo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Altere o status das confecções para simular a esteira de fabricação e ver as atualizações em tempo real.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-500">
          <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-50/50 rounded-lg">
            <tr>
              <th scope="col" className="px-4 py-3 rounded-l-lg font-bold">Cliente / Encomenda</th>
              <th scope="col" className="px-4 py-3 font-bold">Status Atual</th>
              <th scope="col" className="px-4 py-3 text-right rounded-r-lg font-bold">Ações Administrativas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60">
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-10 text-slate-400 font-medium">
                  Nenhum pedido cadastrado no momento. Registre novos pedidos no formulário correspondente.
                </td>
              </tr>
            ) : (
              pedidos.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="px-4 py-4 text-left">
                    <div className="font-bold text-slate-800 text-xs">{pedido.nome}</div>
                    <div className="text-[11px] text-slate-550 font-bold mt-0.5">{pedido.pedido}</div>
                  </td>
                  <td className="px-4 py-4 text-left">
                    <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                      pedido.status === "Pendente" ? "bg-slate-50 text-slate-500 border-slate-100" :
                      pedido.status === "Processando" ? "bg-amber-50/40 text-amber-700 border-amber-100/60" :
                      pedido.status === "Enviado" ? "bg-blue-50/40 text-blue-600 border-blue-100/60" :
                      "bg-emerald-50/40 text-emerald-700 border-emerald-100/60"
                    }`}>
                      {pedido.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {loadingId === pedido.id ? (
                        <div className="flex items-center space-x-1 text-[11px] text-black font-semibold py-1 px-3">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Atualizando...</span>
                        </div>
                      ) : (
                        <>
                          <button
                            title="Mudar para Pendente"
                            onClick={() => handleStatusUpdate(pedido.id, "Pendente")}
                            className={`p-1.5 px-3 rounded-lg text-[10px] transition-all font-bold tracking-wider uppercase ${getStatusButtonClass(pedido.status, "Pendente")}`}
                          >
                            <Clock className="h-3 w-3 inline mr-1" />
                            Pendente
                          </button>
                          <button
                            title="Mudar para Em Separação"
                            onClick={() => handleStatusUpdate(pedido.id, "Processando")}
                            className={`p-1.5 px-3 rounded-lg text-[10px] transition-all font-bold tracking-wider uppercase ${getStatusButtonClass(pedido.status, "Processando")}`}
                          >
                            <Box className="h-3 w-3 inline mr-1" />
                            Separar
                          </button>
                          <button
                            title="Mudar para Enviado"
                            onClick={() => handleStatusUpdate(pedido.id, "Enviado")}
                            className={`p-1.5 px-3 rounded-lg text-[10px] transition-all font-bold tracking-wider uppercase ${getStatusButtonClass(pedido.status, "Enviado")}`}
                          >
                            <Truck className="h-3 w-3 inline mr-1" />
                            Enviar
                          </button>
                          <button
                            title="Mudar para Entregue"
                            onClick={() => handleStatusUpdate(pedido.id, "Entregue")}
                            className={`p-1.5 px-3 rounded-lg text-[10px] transition-all font-bold tracking-wider uppercase ${getStatusButtonClass(pedido.status, "Entregue")}`}
                          >
                            <CheckCircle2 className="h-3 w-3 inline mr-1" />
                            Entregar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

