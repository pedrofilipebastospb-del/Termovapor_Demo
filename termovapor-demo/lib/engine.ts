// Regras de negócio derivadas (sem efeitos secundários): necessidades de
// material, cobertura de stock, custos internos e progresso das OIF.
import type { Artigo, OIF, Quadro, State } from "@/types";
import { ETAPAS } from "@/data/eletrico";
import { sum } from "./format";

export const OIF_ATIVA = (o: OIF) => o.estado !== "Concluída" && o.estado !== "Cancelada";

export const quadroDe = (state: State, oif: OIF) => state.quadros.find((q) => q.id === oif.quadroId);

export const artigoMap = (state: State) => new Map(state.artigos.map((a) => [a.id, a]));

export const livre = (a: Artigo) => Math.max(0, a.stock - a.reservado);

export const stockCritico = (a: Artigo) => a.stockRegistado !== false && livre(a) < a.minimo;

export function necessidades(quadro: Quadro | undefined, quantidade = 1) {
  const map = new Map<string, number>();
  for (const linha of quadro?.linhas ?? []) {
    if (!linha.artigoId) continue;
    map.set(linha.artigoId, (map.get(linha.artigoId) ?? 0) + linha.quantidade * quantidade);
  }
  return map;
}

export type Cobertura = {
  artigo: Artigo;
  necessario: number;
  reservado: number;
  livre: number;
  porReservar: number;
  falta: number;
  custo: number;
};

export function cobertura(state: State, oif: OIF): Cobertura[] {
  const arts = artigoMap(state);
  const rows: Cobertura[] = [];
  for (const [artigoId, necessario] of (oif.materiaisConfirmados ? new Map(oif.materiaisConfirmados.map((m) => [m.artigoId, m.quantidade])) : necessidades(quadroDe(state, oif), oif.quantidade))) {
    const artigo = arts.get(artigoId);
    if (!artigo) continue;
    const reservado = oif.reservas[artigoId] ?? 0;
    const pendente = Math.max(0, necessario - reservado);
    const disponivel = artigo.stockRegistado === false ? 0 : livre(artigo);
    const porReservar = Math.min(pendente, disponivel);
    rows.push({
      artigo,
      necessario,
      reservado,
      livre: disponivel,
      porReservar,
      falta: OIF_ATIVA(oif) && artigo.stockRegistado !== false ? pendente - porReservar : 0,
      custo: oif.custos[artigoId] ?? artigo.custo,
    });
  }
  return rows.sort((a, b) => b.falta - a.falta || a.artigo.codigo.localeCompare(b.artigo.codigo));
}

export const linhasSemArtigo = (quadro?: Quadro) => (quadro?.linhas ?? []).filter((l) => !l.artigoId);

export function custosOIF(state: State, oif: OIF) {
  const materiais = sum(cobertura(state, oif), (c) => c.necessario * c.custo);
  const semCusto = cobertura(state, oif).filter((c) => !c.custo).length;
  return { materiais, maoObra: oif.maoObra, outros: oif.outrosCustos, total: materiais + oif.maoObra + oif.outrosCustos, semCusto };
}

export const etapaAtual = (oif: OIF) => (oif.etapas.length >= ETAPAS.length ? null : ETAPAS[oif.etapas.length]);

export const progressoOIF = (oif: OIF) => oif.etapas.length / ETAPAS.length;

export function pendenciasOIF(state: State, oif: OIF): string[] {
  const out: string[] = [];
  const quadro = quadroDe(state, oif);
  if (!OIF_ATIVA(oif)) return out;
  if (!oif.responsavel) out.push("Atribuir responsável à OIF.");
  if (!quadro?.pdf) out.push("Associar o PDF completo do SEE Electrical ao quadro.");
  else if (!quadro.linhas.length) out.push("Extrair a lista de materiais do PDF SEE.");
  const sem = linhasSemArtigo(quadro).length;
  if (sem) out.push(`${sem} ${sem === 1 ? "linha de material sem artigo associado" : "linhas de material sem artigo associado"}.`);
  const desconhecidos = cobertura(state, oif).filter((c) => c.artigo.stockRegistado === false);
  if (desconhecidos.length) out.push(`${desconhecidos.length} artigos sem registo de stock. Confirmar disponibilidade.`);
  const faltas = cobertura(state, oif).filter((c) => c.falta > 0);
  if (faltas.length) out.push(`${faltas.length} ${faltas.length === 1 ? "artigo com falta real" : "artigos com falta real"} de stock.`);
  const porReservar = cobertura(state, oif).filter((c) => c.porReservar > 0).length;
  if (porReservar && oif.etapas.length >= 3) out.push(`${porReservar} artigos com stock livre por reservar.`);
  if (custosOIF(state, oif).semCusto) out.push("Existem artigos sem custo interno definido.");
  return out;
}

export function nextNF(state: State) {
  return Math.max(state.sequencias.nf, ...state.nfReservados) + 1;
}

export function nextSubNF(state: State, principal: string) {
  const usados = state.nfs.filter((n) => n.principal === principal).map((n) => Number(n.numero.split("/")[1]) || 0);
  return `${principal}/${Math.max(0, ...usados) + 1}`;
}

export const nfLabel = (numero: string) => `NF ${numero}`;
