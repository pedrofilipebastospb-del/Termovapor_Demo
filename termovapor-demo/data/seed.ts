import type { State } from "@/types";
// The actual initial state is loaded from the local, ignored source snapshot.
export function buildSeed(): State {
  return { clientes: [], oes: [], nfs: [], documentos: [], pedidos: [], artigos: [], quadros: [], oifs: [], fornecedores: [], encomendas: [], rececoes: [], movimentos: [], auditoria: [], sequencias: { oe: 0, nf: 0, oif: 0, encomenda: 0, rececao: 0 }, nfReservados: [] };
}
