export interface Pedido {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cep: string;
  pedido: string;
  status: 'Pendente' | 'Processando' | 'Enviado' | 'Entregue';
  created_at: string;
}

export const OPCOES_ROUPAS = [
  "Camisa Nike Dri-FIT",
  "Moletom Adidas Originals",
  "Calça Jogger Puma Classic",
  "Tênis Reebok Club C",
  "Jaqueta Corta-Vento Under Armour"
];
