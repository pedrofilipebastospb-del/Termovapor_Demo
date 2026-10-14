import type { Auditoria, State } from "@/types";
import { clientes } from "./clientes";
import { documentos, nfs, oes, pedidos } from "./ordens";
import { artigos, encomendas, fornecedores, movimentosBase, oifs, quadros, rececoes } from "./eletrico";
import { necessidades } from "@/lib/engine";
import { reservarMateriais } from "@/lib/actions";

const au = (id: string, data: string, entidade: Auditoria["entidade"], referencia: string, acao: string, detalhe: string, utilizador: string): Auditoria => ({ id, data, entidade, referencia, acao, detalhe, utilizador });

const auditoria: Auditoria[] = [
  au("s25", "2026-10-13T16:42:00", "Encomenda", "ENC-2026-042", "Criação", "Reposição de stock mínimo — instrumentação", "Rui Ferreira"),
  au("s24", "2026-10-12T09:15:00", "OE", "OE 877", "Criação", "Cervejaria Artesanal Ponte Velha, Lda — Depósito de condensados atmosférico", "Ana Sousa"),
  au("s23", "2026-10-12T09:18:00", "NF", "NF 1124", "Atribuição", "OE 877 — Depósito de condensados", "Ana Sousa"),
  au("s22", "2026-10-09T11:05:00", "Pedido", "OE870-EL-006", "Enviado ao OIF", "NF 1115 e informação elétrica exportados", "Nuno Barros"),
  au("s21", "2026-10-09T11:05:00", "OIF", "OIF-2026-032", "Criação automática", "A partir do pedido OE870-EL-006", "Sistema"),
  au("s20", "2026-10-06T14:20:00", "OE", "OE 876", "Criação", "Clínica Termal das Caldas Novas — Termoacumulador de 3000 L em AISI 316", "Nuno Barros"),
  au("s19", "2026-10-03T10:02:00", "Encomenda", "ENC-2026-039", "Receção parcial", "Calha técnica recebida; calha DIN pendente", "Rui Ferreira"),
  au("s18", "2026-10-02T15:31:00", "Encomenda", "ENC-2026-040", "Alteração de estado", "Rascunho → Enviada", "Rui Ferreira"),
  au("s17", "2026-10-01T09:47:00", "Encomenda", "ENC-2026-041", "Criação", "Faltas da OIF-2026-030", "Rui Ferreira"),
  au("s16", "2026-09-30T17:10:00", "Artigo", "EL01072", "Ajuste de stock", "Correção após inventário (+1)", "Rui Ferreira"),
  au("s15", "2026-09-29T12:00:00", "OIF", "OIF-2026-031", "Reserva de materiais", "Todos os materiais reservados", "Rui Ferreira"),
  au("s14", "2026-09-29T08:40:00", "OE", "OE 875", "Criação", "Papel & Cartão do Vouga, S.A. — Economizador e coletor de distribuição de vapor", "Marta Lopes"),
  au("s13", "2026-09-18T10:12:00", "OIF", "OIF-2026-028", "Reserva de materiais", "Todos os materiais reservados", "Rui Ferreira"),
  au("s12", "2026-09-15T16:25:00", "OE", "OE 874", "Criação", "Lavandaria Industrial do Sado, Lda — Caldeira Turbovap 900", "Ana Sousa"),
  au("s11", "2026-09-12T11:33:00", "Quadro", "QE-OE870-EL-005", "Extração da lista de equipamentos", "31 linhas extraídas · 0 não cadastradas", "Rui Ferreira"),
  au("s10", "2026-09-08T09:00:00", "OE", "OE 873", "Criação", "Carnes Planalto, S.A. — Assistência ao queimador", "Nuno Barros"),
  au("s09", "2026-09-04T17:55:00", "OIF", "OIF-2026-024", "Concluída e devolvida à OE", "Pedido OE864-EL-001 · revisão R02", "Rui Ferreira"),
  au("s08", "2026-09-03T10:40:00", "OIF", "OIF-2026-030", "Reserva de materiais", "Variador 1,5 kW sem stock — falta real", "Rui Ferreira"),
  au("s07", "2026-09-01T09:30:00", "Pedido", "OE870-EL-005", "Enviado ao OIF", "NF 1112/2 e informação elétrica exportados", "Nuno Barros"),
  au("s06", "2026-08-28T14:02:00", "Pedido", "OE871-EL-001", "Enviado ao OIF", "NF 1117 e informação elétrica exportados", "Ana Sousa"),
  au("s05", "2026-08-25T10:10:00", "OE", "OE 872", "Criação", "Destilaria Quinta do Freixo, Lda — Caldeira Vapobloc 40 m²", "Marta Lopes"),
  au("s04", "2026-08-12T15:45:00", "NF", "NF 1113", "Conversão de termoacumulador", "Termoacumulador 1 da caldeira NF 1112 convertido em NF principal", "Nuno Barros"),
  au("s03", "2026-08-12T15:47:00", "NF", "NF 1114", "Conversão de termoacumulador", "Termoacumulador 2 da caldeira NF 1112 convertido em NF principal", "Nuno Barros"),
  au("s02", "2026-08-07T08:55:00", "Pedido", "OE868-EL-001", "Enviado ao OIF", "NF 1110 e informação elétrica exportados", "Marta Lopes"),
  au("s01", "2026-07-21T09:20:00", "OE", "OE 870", "Criação", "Conservas Atlântico Norte, S.A. — Central de vapor", "Nuno Barros"),
];

export function buildSeed(): State {
  let state: State = {
    clientes,
    oes,
    nfs,
    documentos,
    pedidos,
    artigos: artigos.map((a) => ({ ...a })),
    quadros,
    oifs: oifs.map((o) => {
      // Custos congelados quando o projeto SEE foi validado.
      if (o.etapas.length < 3) return o;
      const quadro = quadros.find((q) => q.id === o.quadroId);
      const custos: Record<string, number> = {};
      for (const id of necessidades(quadro).keys()) custos[id] = artigos.find((a) => a.id === id)?.custo ?? 0;
      return { ...o, custos };
    }),
    fornecedores,
    encomendas,
    rececoes,
    movimentos: movimentosBase,
    auditoria,
    sequencias: { oe: 877, nf: 1124, oif: 32, encomenda: 42, rececao: 21 },
    nfReservados: [1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1113, 1114, 1115, 1116, 1117, 1118, 1119, 1120, 1121, 1122, 1123, 1124],
  };
  // Reservas atuais: geradas pelas mesmas regras usadas na interface.
  for (const numero of ["OIF-2026-028", "OIF-2026-031", "OIF-2026-030"]) {
    [state] = reservarMateriais(state, numero, "Rui Ferreira", { silencioso: true });
  }
  const dataReserva: Record<string, string> = { "OIF-2026-028": "2026-09-18", "OIF-2026-031": "2026-09-29", "OIF-2026-030": "2026-09-03" };
  state = {
    ...state,
    movimentos: state.movimentos
      .map((m, i) => (m.tipo === "Reserva" && dataReserva[m.documento] ? { ...m, id: `mr${i}`, data: dataReserva[m.documento] } : m))
      .sort((a, b) => b.data.localeCompare(a.data)),
  };
  return state;
}
