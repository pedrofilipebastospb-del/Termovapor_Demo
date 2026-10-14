// Modelo de dados da demonstração Termovapor.
// Reflete a estrutura funcional das aplicações OE (Ordens de Execução) e
// OIF Elétrico, simplificada para uma demo frontend com dados sintéticos.

export type OEEstado =
  | "Nova"
  | "Em preparação"
  | "Em execução"
  | "Aguarda material"
  | "Suspensa"
  | "Concluída"
  | "Fechada"
  | "Anulada";

export type NFEstado =
  | "Definição"
  | "Em preparação"
  | "Em fabrico"
  | "Aguarda material"
  | "Concluído"
  | "Anulado";

export type Prioridade = "Normal" | "Urgente";

export type RegistoTipo =
  | "Equipamento novo"
  | "Componente novo"
  | "Reparação / intervenção"
  | "Alteração / modificação"
  | "Assistência / manutenção";

export type Cliente = {
  codigo: string; // N.º SAGE
  nome: string;
  morada: string;
  localidade: string;
  nif: string;
};

export type OE = {
  numero: number;
  dataCriacao: string;
  dataEntrega: string;
  clienteCodigo: string;
  cliente: string;
  moradaCliente: string;
  moradaInstalacao: string;
  encomendaCliente: string;
  orcamento: string;
  descricao: string;
  responsavel: string;
  prioridade: Prioridade;
  estado: OEEstado;
  observacoes: string;
};

export type NF = {
  numero: string; // "1043" (principal) ou "1043/2" (sub-NF)
  oe: number;
  tipo: string;
  registoTipo: RegistoTipo;
  designacao: string;
  estado: NFEstado;
  principal?: string; // NF principal, quando é sub-NF
  campos: Record<string, string>;
};

export type DocCategoria =
  | "Geral OE"
  | "Desenhos"
  | "Cálculos"
  | "Certificados"
  | "Manuais / fichas técnicas"
  | "Elétrica / automação"
  | "Inspeções / ensaios"
  | "Documentação cliente";

export type Documento = {
  id: string;
  oe: number;
  nf?: string;
  categoria: DocCategoria;
  descricao: string;
  nome: string;
  data: string;
  paginas: number;
};

export type PedidoEstado = "Não enviado" | "Enviado ao OIF" | "Em execução" | "Devolvido à OE";

export type PedidoEletrico = {
  codigo: string; // OE870-EL-005
  oe: number;
  titulo: string;
  quadroNf: string;
  nfs: string[];
  hmi: "Com HMI" | "Sem HMI" | "A definir";
  alimentacao: string;
  motores: string;
  sondas: string;
  requisitos: string;
  estado: PedidoEstado;
  revisao: number;
  oif?: string;
  dataEnvio?: string;
  dataDevolucao?: string;
  definicaoFinal?: string;
};

export type Artigo = {
  id: string;
  codigo: string;
  codigoInterno: string;
  descricao: string;
  marca: string;
  referencia: string;
  categoria: string;
  unidade: string;
  stock: number;
  reservado: number;
  minimo: number;
  localizacao: string;
  custo: number;
};

export type LinhaMaterial = {
  id: string;
  artigoId: string | null;
  refExtraida: string;
  descricaoExtraida: string;
  fabricante: string;
  designacao: string; // designação funcional no esquema (ex.: -Q1, -KM2)
  quantidade: number;
  custoAplicado?: number;
};

export type Quadro = {
  id: string;
  codigo: string;
  descricao: string;
  oe: number;
  nf: string;
  cliente: string;
  esquema: string;
  revisao: string;
  pdf: string;
  extraidoEm?: string;
  linhas: LinhaMaterial[];
};

export type OIFEstado =
  | "Aberta"
  | "Aguarda material"
  | "Material reservado"
  | "Em montagem"
  | "Em teste"
  | "Concluída"
  | "Cancelada";

export type Etapa = {
  etapa: string;
  data: string;
  utilizador: string;
  nota?: string;
};

export type OIF = {
  numero: string;
  quadroId: string;
  pedido: string;
  oe: number;
  nf: string;
  quantidade: number;
  estado: OIFEstado;
  responsavel: string;
  prazo: string;
  criadaEm: string;
  etapas: Etapa[];
  reservas: Record<string, number>; // artigoId -> quantidade reservada
  custos: Record<string, number>; // artigoId -> custo unitário congelado
  maoObra: number;
  outrosCustos: number;
  observacoes: string;
};

export type Fornecedor = {
  codigo: string;
  nome: string;
  nif: string;
  email: string;
  telefone: string;
  prazoMedio: number;
};

export type EncomendaEstado =
  | "Rascunho"
  | "Enviada"
  | "Confirmada"
  | "Recebida parcial"
  | "Recebida"
  | "Cancelada";

export type Encomenda = {
  numero: string;
  fornecedor: string;
  oif?: string;
  data: string;
  previsao: string;
  estado: EncomendaEstado;
  linhas: { artigoId: string; quantidade: number; preco: number; recebido: number }[];
};

export type Rececao = {
  numero: string;
  encomenda: string;
  data: string;
  guia: string;
  linhas: { artigoId: string; quantidade: number }[];
};

export type MovimentoTipo = "Entrada" | "Saída" | "Reserva" | "Libertação" | "Ajuste";

export type Movimento = {
  id: string;
  artigoId: string;
  tipo: MovimentoTipo;
  quantidade: number;
  documento: string;
  data: string;
  observacoes: string;
};

export type Auditoria = {
  id: string;
  data: string; // ISO com hora
  entidade: "OE" | "NF" | "Pedido" | "OIF" | "Quadro" | "Artigo" | "Encomenda" | "Sistema";
  referencia: string;
  acao: string;
  detalhe: string;
  utilizador: string;
};

export type Perfil = "Administração" | "Engenharia / OE" | "Eletricidade / OIF";

export type State = {
  clientes: Cliente[];
  oes: OE[];
  nfs: NF[];
  documentos: Documento[];
  pedidos: PedidoEletrico[];
  artigos: Artigo[];
  quadros: Quadro[];
  oifs: OIF[];
  fornecedores: Fornecedor[];
  encomendas: Encomenda[];
  rececoes: Rececao[];
  movimentos: Movimento[];
  auditoria: Auditoria[];
  sequencias: { oe: number; nf: number; oif: number; encomenda: number; rececao: number };
  nfReservados: number[]; // NF principais já atribuídos (nunca reutilizados)
};
