// Transições de estado da demo. Todas as funções são puras: recebem o estado
// atual e devolvem um novo estado (mais, quando útil, o identificador criado).
// O registo de auditoria acompanha cada operação, como nas aplicações originais.
import type { Artigo, Auditoria, Documento, NF, OE, OIF, PedidoEletrico, Quadro, State } from "@/types";
import { ETAPAS, extracaoSimulada } from "@/data/eletrico";
import { cobertura, linhasSemArtigo, necessidades, nextNF, nextSubNF, quadroDe } from "./engine";
import { HOJE, nowIso, uid } from "./format";

type Log = Omit<Auditoria, "id" | "data">;

const log = (state: State, entry: Log): State => ({
  ...state,
  auditoria: [{ id: uid("aud"), data: nowIso(), ...entry }, ...state.auditoria],
});

const patchOIF = (state: State, numero: string, fn: (o: OIF) => OIF): State => ({
  ...state,
  oifs: state.oifs.map((o) => (o.numero === numero ? fn(o) : o)),
});

const patchQuadro = (state: State, id: string, fn: (q: Quadro) => Quadro): State => ({
  ...state,
  quadros: state.quadros.map((q) => (q.id === id ? fn(q) : q)),
});

const etapa = (o: OIF, nome: (typeof ETAPAS)[number], utilizador: string, nota?: string): OIF =>
  o.etapas.some((e) => e.etapa === nome) ? o : { ...o, etapas: [...o.etapas, { etapa: nome, data: HOJE, utilizador, nota }] };

// ---------------------------------------------------------------- OE / NF

export type NovaOE = Omit<OE, "numero" | "dataCriacao" | "estado">;

export function criarOE(state: State, dados: NovaOE, user: string): [State, number] {
  const numero = state.sequencias.oe + 1;
  const oe: OE = { ...dados, numero, dataCriacao: HOJE, estado: "Nova" };
  let next: State = { ...state, oes: [oe, ...state.oes], sequencias: { ...state.sequencias, oe: numero } };
  next = log(next, { entidade: "OE", referencia: `OE ${numero}`, acao: "Criação", detalhe: `${dados.cliente} — ${dados.descricao}`, utilizador: user });
  return [next, numero];
}

export function atualizarOE(state: State, numero: number, patch: Partial<OE>, user: string): State {
  const antes = state.oes.find((o) => o.numero === numero);
  const next = { ...state, oes: state.oes.map((o) => (o.numero === numero ? { ...o, ...patch } : o)) };
  const detalhe = patch.estado && antes?.estado !== patch.estado ? `Estado: ${antes?.estado} → ${patch.estado}` : "Dados gerais atualizados";
  return log(next, { entidade: "OE", referencia: `OE ${numero}`, acao: patch.estado ? "Alteração de estado" : "Edição", detalhe, utilizador: user });
}

export type NovoNF = { oe: number; tipo: string; registoTipo: NF["registoTipo"]; designacao: string; principal?: string };

export function adicionarNF(state: State, dados: NovoNF, user: string): [State, string] {
  let numero: string;
  let next = state;
  if (dados.principal) {
    numero = nextSubNF(state, dados.principal);
  } else {
    const n = nextNF(state);
    numero = String(n);
    // O NF principal fica reservado na sequência global e nunca é reutilizado.
    next = { ...next, sequencias: { ...next.sequencias, nf: n }, nfReservados: [...next.nfReservados, n] };
  }
  const nf: NF = { numero, oe: dados.oe, tipo: dados.tipo, registoTipo: dados.registoTipo, designacao: dados.designacao, estado: "Definição", principal: dados.principal, campos: {} };
  next = { ...next, nfs: [...next.nfs, nf] };
  next = log(next, { entidade: "NF", referencia: `NF ${numero}`, acao: "Atribuição", detalhe: `OE ${dados.oe} — ${dados.tipo}: ${dados.designacao}`, utilizador: user });
  return [next, numero];
}

export function atualizarNF(state: State, numero: string, patch: Partial<NF>, user: string): State {
  const next = { ...state, nfs: state.nfs.map((n) => (n.numero === numero ? { ...n, ...patch, campos: { ...n.campos, ...(patch.campos ?? {}) } } : n)) };
  return log(next, { entidade: "NF", referencia: `NF ${numero}`, acao: patch.estado ? "Alteração de estado" : "Definição técnica", detalhe: patch.estado ? `Novo estado: ${patch.estado}` : "Campos técnicos guardados", utilizador: user });
}

export function anexarDocumento(state: State, doc: Omit<Documento, "id" | "data">, user: string): State {
  const next = { ...state, documentos: [{ ...doc, id: uid("doc"), data: HOJE }, ...state.documentos] };
  return log(next, { entidade: doc.nf ? "NF" : "OE", referencia: doc.nf ? `NF ${doc.nf}` : `OE ${doc.oe}`, acao: "Documento anexado", detalhe: `${doc.categoria}: ${doc.nome}`, utilizador: user });
}

// ------------------------------------------------------- Pedidos OE → OIF

export type NovoPedido = Omit<PedidoEletrico, "codigo" | "estado" | "revisao" | "oif" | "dataEnvio" | "dataDevolucao" | "definicaoFinal">;

export function criarPedido(state: State, dados: NovoPedido, user: string): [State, string] {
  const existentes = state.pedidos.filter((p) => p.oe === dados.oe).map((p) => Number(p.codigo.split("-EL-")[1]) || 0);
  const codigo = `OE${dados.oe}-EL-${String(Math.max(0, ...existentes) + 1).padStart(3, "0")}`;
  const pedido: PedidoEletrico = { ...dados, codigo, estado: "Não enviado", revisao: 0 };
  const next = { ...state, pedidos: [...state.pedidos, pedido] };
  return [log(next, { entidade: "Pedido", referencia: codigo, acao: "Criação", detalhe: dados.titulo, utilizador: user }), codigo];
}

// Envia a folha elétrica para o OIF: o OIF recebe apenas o NF e a informação
// elétrica/automação e cria automaticamente o quadro e a OIF correspondentes.
export function enviarPedido(state: State, codigo: string, user: string): [State, string] {
  const pedido = state.pedidos.find((p) => p.codigo === codigo);
  if (!pedido) return [state, ""];
  const seq = state.sequencias.oif + 1;
  const numeroOIF = `OIF-2026-${String(seq).padStart(3, "0")}`;
  const oe = state.oes.find((o) => o.numero === pedido.oe);
  const quadro: Quadro = {
    id: uid("q"), codigo: `QE-${codigo}`, descricao: pedido.titulo, oe: pedido.oe, nf: pedido.quadroNf, cliente: oe?.cliente ?? "",
    esquema: `SEE-${pedido.oe}-${codigo.split("-EL-")[1]}`, revisao: "R00", pdf: "", linhas: [],
  };
  const oif: OIF = {
    numero: numeroOIF, quadroId: quadro.id, pedido: codigo, oe: pedido.oe, nf: pedido.quadroNf, quantidade: 1, estado: "Aberta", responsavel: "",
    prazo: oe?.dataEntrega ?? HOJE, criadaEm: HOJE,
    etapas: [
      { etapa: "Pedido recebido", data: HOJE, utilizador: "Sistema" },
      { etapa: "OIF criada", data: HOJE, utilizador: "Sistema" },
    ],
    reservas: {}, custos: {}, maoObra: 0, outrosCustos: 0, observacoes: "",
  };
  let next: State = {
    ...state,
    pedidos: state.pedidos.map((p) => (p.codigo === codigo ? { ...p, estado: "Enviado ao OIF", oif: numeroOIF, dataEnvio: HOJE } : p)),
    quadros: [...state.quadros, quadro],
    oifs: [...state.oifs, oif],
    nfs: state.nfs.map((n) => (n.numero === pedido.quadroNf ? { ...n, campos: { ...n.campos, el_oif: numeroOIF } } : n)),
    sequencias: { ...state.sequencias, oif: seq },
  };
  next = log(next, { entidade: "Pedido", referencia: codigo, acao: "Enviado ao OIF", detalhe: `NF ${pedido.quadroNf} e informação elétrica exportados`, utilizador: user });
  next = log(next, { entidade: "OIF", referencia: numeroOIF, acao: "Criação automática", detalhe: `A partir do pedido ${codigo}`, utilizador: "Sistema" });
  return [next, numeroOIF];
}

// ------------------------------------------------------ Quadros / SEE PDF

export function associarPDF(state: State, quadroId: string, user: string): State {
  const q = state.quadros.find((x) => x.id === quadroId);
  if (!q) return state;
  const pdf = `${q.codigo}_${q.revisao}.pdf`;
  return log(patchQuadro(state, quadroId, (x) => ({ ...x, pdf })), { entidade: "Quadro", referencia: q.codigo, acao: "PDF SEE associado", detalhe: pdf, utilizador: user });
}

export function extrairMateriais(state: State, quadroId: string, user: string): State {
  const q = state.quadros.find((x) => x.id === quadroId);
  if (!q) return state;
  const linhas = extracaoSimulada().map((l) => ({ ...l, id: uid("l") }));
  const sem = linhas.filter((l) => !l.artigoId).length;
  const next = patchQuadro(state, quadroId, (x) => ({ ...x, linhas, extraidoEm: HOJE }));
  return log(next, { entidade: "Quadro", referencia: q.codigo, acao: "Extração da lista de equipamentos", detalhe: `${linhas.length} linhas extraídas · ${sem} não cadastradas`, utilizador: user });
}

export function associarArtigo(state: State, quadroId: string, linhaId: string, artigoId: string, user: string): State {
  const art = state.artigos.find((a) => a.id === artigoId);
  const q = state.quadros.find((x) => x.id === quadroId);
  const next = patchQuadro(state, quadroId, (x) => ({
    ...x,
    linhas: x.linhas.map((l) => (l.id === linhaId ? { ...l, artigoId, descricaoExtraida: l.descricaoExtraida || art?.descricao || "", fabricante: l.fabricante || art?.marca || "" } : l)),
  }));
  return log(next, { entidade: "Quadro", referencia: q?.codigo ?? "", acao: "Artigo associado", detalhe: `${art?.codigo} — ${art?.descricao}`, utilizador: user });
}

export function criarArtigoDeLinha(state: State, quadroId: string, linhaId: string, dados: Pick<Artigo, "descricao" | "marca" | "referencia" | "categoria" | "custo">, user: string): State {
  const seq = Math.max(...state.artigos.map((a) => Number(a.codigo.slice(2)) || 0)) + 1;
  const codigo = `EL${String(seq).padStart(5, "0")}`;
  const artigo: Artigo = { id: uid("a"), codigo, codigoInterno: `TV-${codigo.slice(2)}`, unidade: "un", stock: 0, reservado: 0, minimo: 0, localizacao: "—", ...dados };
  let next: State = { ...state, artigos: [...state.artigos, artigo] };
  next = log(next, { entidade: "Artigo", referencia: codigo, acao: "Cadastro a partir do PDF", detalhe: `${dados.referencia} — ${dados.descricao}`, utilizador: user });
  return associarArtigo(next, quadroId, linhaId, artigo.id, user);
}

export function atualizarArtigo(state: State, id: string, patch: Partial<Artigo>, user: string, acao = "Edição"): State {
  const art = state.artigos.find((a) => a.id === id);
  const next = { ...state, artigos: state.artigos.map((a) => (a.id === id ? { ...a, ...patch } : a)) };
  return log(next, { entidade: "Artigo", referencia: art?.codigo ?? id, acao, detalhe: Object.keys(patch).join(", "), utilizador: user });
}

export function ajustarStock(state: State, id: string, novoStock: number, motivo: string, user: string): State {
  const art = state.artigos.find((a) => a.id === id);
  if (!art || novoStock === art.stock) return state;
  const diff = novoStock - art.stock;
  const next: State = {
    ...state,
    artigos: state.artigos.map((a) => (a.id === id ? { ...a, stock: novoStock } : a)),
    movimentos: [{ id: uid("mv"), artigoId: id, tipo: "Ajuste", quantidade: Math.abs(diff), documento: "AJ-MANUAL", data: HOJE, observacoes: `${diff > 0 ? "+" : "−"}${Math.abs(diff)} · ${motivo || "Ajuste manual"}` }, ...state.movimentos],
  };
  return log(next, { entidade: "Artigo", referencia: art.codigo, acao: "Ajuste de stock", detalhe: `${art.stock} → ${novoStock}${motivo ? ` · ${motivo}` : ""}`, utilizador: user });
}

export function atualizarLinha(state: State, quadroId: string, linhaId: string, quantidade: number): State {
  return patchQuadro(state, quadroId, (x) => ({ ...x, linhas: x.linhas.map((l) => (l.id === linhaId ? { ...l, quantidade } : l)) }));
}

export function removerLinha(state: State, quadroId: string, linhaId: string): State {
  return patchQuadro(state, quadroId, (x) => ({ ...x, linhas: x.linhas.filter((l) => l.id !== linhaId) }));
}

// ------------------------------------------------------------ OIF / stock

export function atualizarOIF(state: State, numero: string, patch: Partial<Pick<OIF, "responsavel" | "prazo" | "maoObra" | "outrosCustos" | "observacoes">>, user: string): State {
  return log(patchOIF(state, numero, (o) => ({ ...o, ...patch })), { entidade: "OIF", referencia: numero, acao: "Edição", detalhe: Object.keys(patch).join(", "), utilizador: user });
}

export function validarProjeto(state: State, numero: string, user: string): State {
  const oif = state.oifs.find((o) => o.numero === numero);
  if (!oif) return state;
  const quadro = quadroDe(state, oif);
  if (!quadro?.linhas.length || linhasSemArtigo(quadro).length) return state;
  // O custo interno de cada artigo fica congelado na OIF (snapshot).
  const custos: Record<string, number> = {};
  for (const id of necessidades(quadro).keys()) custos[id] = state.artigos.find((a) => a.id === id)?.custo ?? 0;
  const next = patchOIF(state, numero, (o) => etapa({ ...o, custos }, "Projeto SEE", user));
  return log(next, { entidade: "OIF", referencia: numero, acao: "Projeto SEE validado", detalhe: `${quadro.linhas.length} linhas confirmadas`, utilizador: user });
}

// Atualiza deliberadamente o snapshot de custos da OIF com os custos atuais dos artigos.
export function atualizarCustosOIF(state: State, numero: string, user: string): State {
  const oif = state.oifs.find((o) => o.numero === numero);
  if (!oif) return state;
  const custos: Record<string, number> = {};
  for (const id of necessidades(quadroDe(state, oif)).keys()) custos[id] = state.artigos.find((a) => a.id === id)?.custo ?? 0;
  return log(patchOIF(state, numero, (o) => ({ ...o, custos })), { entidade: "OIF", referencia: numero, acao: "Custos atualizados", detalhe: "Snapshot substituído pelos custos atuais dos artigos", utilizador: user });
}

export function reservarMateriais(state: State, numero: string, user: string, opts: { silencioso?: boolean } = {}): [State, number] {
  const oif = state.oifs.find((o) => o.numero === numero);
  if (!oif) return [state, 0];
  const rows = cobertura(state, oif);
  const reservas = { ...oif.reservas };
  const artigos = state.artigos.map((a) => {
    const row = rows.find((r) => r.artigo.id === a.id);
    if (!row?.porReservar) return a;
    reservas[a.id] = (reservas[a.id] ?? 0) + row.porReservar;
    return { ...a, reservado: a.reservado + row.porReservar };
  });
  const novos = rows
    .filter((r) => r.porReservar > 0)
    .map((r) => ({ id: uid("mv"), artigoId: r.artigo.id, tipo: "Reserva" as const, quantidade: r.porReservar, documento: numero, data: HOJE, observacoes: "Reserva para OIF" }));
  const faltas = rows.filter((r) => r.falta > 0).length;
  let next: State = { ...state, artigos, movimentos: [...novos, ...state.movimentos] };
  next = patchOIF(next, numero, (o) => {
    const base = { ...o, reservas };
    if (opts.silencioso) return base;
    if (faltas) return { ...base, estado: "Aguarda material" };
    return etapa({ ...base, estado: o.estado === "Aberta" || o.estado === "Aguarda material" ? "Material reservado" : o.estado }, "Materiais / stock", user);
  });
  if (!opts.silencioso) {
    next = log(next, { entidade: "OIF", referencia: numero, acao: "Reserva de materiais", detalhe: faltas ? `${novos.length} artigos reservados · ${faltas} com falta real` : "Todos os materiais reservados", utilizador: user });
  }
  return [next, faltas];
}

export function iniciarMontagem(state: State, numero: string, user: string): State {
  return log(patchOIF(state, numero, (o) => ({ ...o, estado: "Em montagem" })), { entidade: "OIF", referencia: numero, acao: "Montagem iniciada", detalhe: "", utilizador: user });
}

export function concluirMontagem(state: State, numero: string, user: string): State {
  return log(patchOIF(state, numero, (o) => etapa({ ...o, estado: "Em teste" }, "Montagem", user)), { entidade: "OIF", referencia: numero, acao: "Montagem concluída", detalhe: "Quadro segue para testes", utilizador: user });
}

export function aprovarTestes(state: State, numero: string, user: string): State {
  return log(patchOIF(state, numero, (o) => etapa(o, "Testes", user, "Ensaios funcionais aprovados")), { entidade: "OIF", referencia: numero, acao: "Testes aprovados", detalhe: "Ensaios funcionais e de isolamento", utilizador: user });
}

// Conclui a OIF: consome o material reservado, devolve a definição final à OE
// e arquiva o esquema elétrico na documentação da OE.
export function devolverOE(state: State, numero: string, definicaoFinal: string, user: string): State {
  const oif = state.oifs.find((o) => o.numero === numero);
  if (!oif) return state;
  const quadro = quadroDe(state, oif);
  const pedido = state.pedidos.find((p) => p.codigo === oif.pedido);
  const revisao = (pedido?.revisao ?? 0) + 1;
  const saidas = Object.entries(oif.reservas)
    .filter(([, q]) => q > 0)
    .map(([artigoId, q]) => ({ id: uid("mv"), artigoId, tipo: "Saída" as const, quantidade: q, documento: numero, data: HOJE, observacoes: "Consumo na montagem" }));
  let next: State = {
    ...state,
    artigos: state.artigos.map((a) => {
      const q = oif.reservas[a.id] ?? 0;
      return q ? { ...a, stock: a.stock - q, reservado: Math.max(0, a.reservado - q) } : a;
    }),
    movimentos: [...saidas, ...state.movimentos],
    pedidos: state.pedidos.map((p) => (p.codigo === oif.pedido ? { ...p, estado: "Devolvido à OE", revisao, dataDevolucao: HOJE, definicaoFinal } : p)),
    nfs: state.nfs.map((n) => (n.numero === oif.nf ? { ...n, estado: "Concluído" } : n)),
    documentos: [
      { id: uid("doc"), oe: oif.oe, nf: oif.nf, categoria: "Elétrica / automação", descricao: `Esquema elétrico devolvido pelo OIF (R${String(revisao).padStart(2, "0")})`, nome: `${oif.pedido}_R${String(revisao).padStart(2, "0")}.pdf`, data: HOJE, paginas: 18 + (quadro?.linhas.length ?? 0) % 9 },
      ...state.documentos,
    ],
  };
  next = patchOIF(next, numero, (o) => etapa({ ...o, estado: "Concluída", reservas: {} }, "Devolvida à OE", user, definicaoFinal));
  return log(next, { entidade: "OIF", referencia: numero, acao: "Concluída e devolvida à OE", detalhe: `Pedido ${oif.pedido} · revisão R${String(revisao).padStart(2, "0")}`, utilizador: user });
}

// ------------------------------------------------------------ Encomendas

export function avancarEncomenda(state: State, numero: string, user: string): State {
  const ordem = ["Rascunho", "Enviada", "Confirmada"] as const;
  const enc = state.encomendas.find((e) => e.numero === numero);
  if (!enc) return state;
  const i = ordem.indexOf(enc.estado as (typeof ordem)[number]);
  if (i < 0 || i >= ordem.length - 1) return state;
  const estado = ordem[i + 1];
  return log({ ...state, encomendas: state.encomendas.map((e) => (e.numero === numero ? { ...e, estado } : e)) }, { entidade: "Encomenda", referencia: numero, acao: "Alteração de estado", detalhe: `${enc.estado} → ${estado}`, utilizador: user });
}

// Receção por linha: aceita quantidades parciais (nunca acima do pendente),
// regista a guia do fornecedor e dá entrada em stock.
export function receberEncomenda(state: State, numero: string, quantidades: Record<string, number>, guia: string, user: string): [State, string] {
  const enc = state.encomendas.find((e) => e.numero === numero);
  if (!enc) return [state, ""];
  const linhas = enc.linhas
    .map((l) => ({ artigoId: l.artigoId, quantidade: Math.max(0, Math.min(quantidades[l.artigoId] ?? 0, l.quantidade - l.recebido)) }))
    .filter((l) => l.quantidade > 0);
  if (!linhas.length) return [state, ""];
  const seq = state.sequencias.rececao + 1;
  const rc = `RC-2026-${String(seq).padStart(3, "0")}`;
  const entradas = linhas.map((l) => ({ id: uid("mv"), artigoId: l.artigoId, tipo: "Entrada" as const, quantidade: l.quantidade, documento: rc, data: HOJE, observacoes: `Receção ${numero}${guia ? ` · guia ${guia}` : ""}` }));
  const novasLinhas = enc.linhas.map((l) => ({ ...l, recebido: l.recebido + (linhas.find((x) => x.artigoId === l.artigoId)?.quantidade ?? 0) }));
  const completa = novasLinhas.every((l) => l.recebido >= l.quantidade);
  const next: State = {
    ...state,
    artigos: state.artigos.map((a) => {
      const l = linhas.find((x) => x.artigoId === a.id);
      return l ? { ...a, stock: a.stock + l.quantidade } : a;
    }),
    movimentos: [...entradas, ...state.movimentos],
    rececoes: [{ numero: rc, encomenda: numero, data: HOJE, guia, linhas }, ...state.rececoes],
    encomendas: state.encomendas.map((e) => (e.numero === numero ? { ...e, estado: completa ? "Recebida" : "Recebida parcial", linhas: novasLinhas } : e)),
    sequencias: { ...state.sequencias, rececao: seq },
  };
  return [log(next, { entidade: "Encomenda", referencia: numero, acao: completa ? "Receção" : "Receção parcial", detalhe: `${rc} · ${linhas.length} artigos com entrada em stock`, utilizador: user }), rc];
}

export function encomendarFaltas(state: State, numero: string, user: string): [State, string] {
  const oif = state.oifs.find((o) => o.numero === numero);
  if (!oif) return [state, ""];
  const faltas = cobertura(state, oif).filter((c) => c.falta > 0);
  if (!faltas.length) return [state, ""];
  const seq = state.sequencias.encomenda + 1;
  const enc = `ENC-2026-${String(seq).padStart(3, "0")}`;
  const next: State = {
    ...state,
    encomendas: [
      { numero: enc, fornecedor: "F002", oif: numero, data: HOJE, previsao: "2026-10-24", estado: "Rascunho", linhas: faltas.map((f) => ({ artigoId: f.artigo.id, quantidade: f.falta, preco: f.artigo.custo, recebido: 0 })) },
      ...state.encomendas,
    ],
    sequencias: { ...state.sequencias, encomenda: seq },
  };
  return [log(next, { entidade: "Encomenda", referencia: enc, acao: "Criação", detalhe: `Faltas da ${numero}`, utilizador: user }), enc];
}
