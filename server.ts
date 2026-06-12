import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

// Tipo para Pedidos dentro do servidor
interface PedidoServidor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  pedido: string;
  status: 'Pendente' | 'Processando' | 'Enviado' | 'Entregue';
  created_at: string;
}

// Banco de dados em memória inicial (Semente)
let databaseEmMemoria: PedidoServidor[] = [
  {
    id: "ped_1",
    nome: "João Silva",
    email: "joao.silva@email.com",
    telefone: "(11) 98765-4321",
    cep: "01310-100",
    pedido: "Camisa Nike Dri-FIT",
    status: "Entregue",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 24 horas atrás
  },
  {
    id: "ped_2",
    nome: "Maria Souza",
    email: "maria.souza@email.com",
    telefone: "(21) 99999-8888",
    cep: "22041-011",
    pedido: "Moletom Adidas Originals",
    status: "Enviado",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString() // 5 horas atrás
  },
  {
    id: "ped_3",
    nome: "Pedro Oliveira",
    email: "pedro.oli@email.com",
    telefone: "(31) 97777-6666",
    cep: "30140-071",
    pedido: "Tênis Reebok Club C",
    status: "Processando",
    created_at: new Date(Date.now() - 1800000).toISOString() // 30 minutos atrás
  }
];

// Inicialização do cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

let supabase: any = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseKey && supabaseUrl !== "MY_SUPABASE_URL" && supabaseKey !== "MY_SUPABASE_KEY") {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    isSupabaseConfigured = true;
    console.log("Servidor: Supabase configurado e cliente criado.");
  } catch (error) {
    console.error("Servidor: Erro ao configurar o cliente Supabase:", error);
  }
} else {
  console.log("Servidor: Supabase não configurado. Utilizando armazenamento em memória (fallback).");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Analisar corpo da requisição em JSON
  app.use(express.json());

  // Rota de configuração para o frontend saber o estado do Supabase
  app.get("/api/config", (req, res) => {
    res.json({
      supabaseConfigured: isSupabaseConfigured,
      supabaseUrl: isSupabaseConfigured ? supabaseUrl : null,
      instructionSQL: `
create table pedidos (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  email text not null,
  telefone text not null,
  cep text not null,
  pedido text not null,
  status text not null default 'Pendente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Adicionar Política RLS para leitura e gravação livre (ou desativar RLS no painel do Supabase)
alter table pedidos enable row level security;
create policy "Acesso público completo" on pedidos for all using (true) with check (true);
      `.trim()
    });
  });

  // Obter todos os pedidos
  app.get("/api/pedidos", async (req, res) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("pedidos")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Servidor: Erro ao buscar no Supabase, talvez tabela não exista:", error.message);
          return res.status(200).json({
            pedidos: databaseEmMemoria,
            source: "local-fallback",
            dbError: `Tabela 'pedidos' não encontrada ou erro no banco. Criando fallback. Erro original: ${error.message}`
          });
        }

        return res.json({
          pedidos: data,
          source: "supabase"
        });
      } catch (err: any) {
        console.error("Servidor: Falha ao requisitar Supabase:", err);
        return res.status(200).json({
          pedidos: databaseEmMemoria,
          source: "local-fallback",
          dbError: err.message || "Erro de conexão genérico"
        });
      }
    } else {
      // Retorna em memória ordenado pelo mais recente
      const sorted = [...databaseEmMemoria].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      res.json({
        pedidos: sorted,
        source: "local"
      });
    }
  });

  // Criar um novo pedido
  app.post("/api/pedidos", async (req, res) => {
    const { nome, email, telefone, cep, pedido } = req.body;

    if (!nome || !email || !telefone || !cep || !pedido) {
      return res.status(400).json({ error: "Todos os campos (nome, email, telefone, cep, pedido) são obrigatórios." });
    }

    const novoPedido: PedidoServidor = {
      id: isSupabaseConfigured ? undefined as any : "ped_" + Date.now(),
      nome,
      email,
      telefone,
      cep,
      pedido,
      status: "Pendente",
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("pedidos")
          .insert([{
            nome,
            email,
            telefone,
            cep,
            pedido,
            status: "Pendente"
          }])
          .select();

        if (error) {
          console.warn("Servidor: Falha ao inserir no Supabase, adicionando no local-fallback:", error.message);
          // Adiciona no local para não quebrar a experiência do usuário
          const fallbackData = { ...novoPedido, id: "ped_" + Date.now() };
          databaseEmMemoria.unshift(fallbackData);
          return res.status(201).json({
            pedido: fallbackData,
            source: "local-fallback",
            dbError: `Erro ao salvar no Supabase (salvando localmente): ${error.message}`
          });
        }

        return res.status(201).json({
          pedido: data[0],
          source: "supabase"
        });
      } catch (err: any) {
        console.error("Servidor: Falha inesperada ao inserir no Supabase:", err);
        const fallbackData = { ...novoPedido, id: "ped_" + Date.now() };
        databaseEmMemoria.unshift(fallbackData);
        return res.status(201).json({
          pedido: fallbackData,
          source: "local-fallback",
          dbError: err.message || "Conexão falhou"
        });
      }
    } else {
      databaseEmMemoria.unshift(novoPedido);
      res.status(201).json({
        pedido: novoPedido,
        source: "local"
      });
    }
  });

  // Atualizar status do pedido (Útil para testar o acompanhamento do fluxo)
  app.patch("/api/pedidos/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ["Pendente", "Processando", "Enviado", "Entregue"];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ error: "Status inválido fornecido." });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        // Verifica se o ID é do formato do Supabase ou UUID
        const { data, error } = await supabase
          .from("pedidos")
          .update({ status })
          .eq("id", id)
          .select();

        if (error) {
          console.warn("Servidor: Falha ao atualizar status no Supabase, atualizando localmente se ID for detectado:", error.message);
          // Tenta no local
          const index = databaseEmMemoria.findIndex(p => p.id === id);
          if (index !== -1) {
            databaseEmMemoria[index].status = status;
            return res.json({ pedido: databaseEmMemoria[index], source: "local-fallback" });
          }
          return res.status(404).json({ error: "Pedido não localizado para atualização." });
        }

        if (!data || data.length === 0) {
          // Tenta no local se não achou no Supabase
          const index = databaseEmMemoria.findIndex(p => p.id === id);
          if (index !== -1) {
            databaseEmMemoria[index].status = status;
            return res.json({ pedido: databaseEmMemoria[index], source: "local-fallback" });
          }
          return res.status(404).json({ error: "Pedido não cadastrado." });
        }

        return res.json({
          pedido: data[0],
          source: "supabase"
        });
      } catch (err: any) {
        console.error("Servidor: Falha inesperada ao atualizar status no Supabase:", err);
        const index = databaseEmMemoria.findIndex(p => p.id === id);
        if (index !== -1) {
          databaseEmMemoria[index].status = status;
          return res.json({ pedido: databaseEmMemoria[index], source: "local-fallback" });
        }
        return res.status(500).json({ error: err.message || "Erro interno de atualização" });
      }
    } else {
      const index = databaseEmMemoria.findIndex(p => p.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Pedido não localizado em memória." });
      }

      databaseEmMemoria[index].status = status;
      res.json({
        pedido: databaseEmMemoria[index],
        source: "local"
      });
    }
  });

  // Vite middleware de desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Painel de Pedidos] Servidor rodando com sucesso no endereço http://localhost:${PORT}`);
  });
}

startServer();
