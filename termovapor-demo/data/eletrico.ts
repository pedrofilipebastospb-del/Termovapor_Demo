import type { Artigo, Encomenda, Fornecedor, LinhaMaterial, Movimento, OIF, Quadro, Rececao } from "@/types";

// Cadastro sintético de material elétrico (equivalente à "Listagem de Material
// Elétrico" importada do SAGE no OIF). Stocks e custos são fictícios.
const a = (id: string, codigo: string, descricao: string, marca: string, referencia: string, categoria: string, stock: number, minimo: number, custo: number, localizacao: string, unidade = "un"): Artigo => ({
  id, codigo, codigoInterno: `TV-${codigo.slice(2)}`, descricao, marca, referencia, categoria, unidade, stock, reservado: 0, minimo, localizacao, custo,
});

export const artigos: Artigo[] = [
  a("a01", "EL01010", "Disjuntor magnetotérmico 3P 16 A curva C", "Schneider Electric", "A9F74316", "Proteção", 24, 10, 18.4, "A1-03"),
  a("a02", "EL01011", "Disjuntor magnetotérmico 1P 6 A curva C", "Schneider Electric", "A9F74106", "Proteção", 40, 15, 7.9, "A1-03"),
  a("a03", "EL01012", "Interruptor seccionador 3P 63 A", "Schneider Electric", "VCF3", "Proteção", 6, 3, 42.5, "A1-04"),
  a("a04", "EL01020", "Disjuntor-motor 1,6–2,5 A", "Schneider Electric", "GV2ME07", "Proteção", 14, 6, 38.2, "A1-05"),
  a("a05", "EL01021", "Disjuntor-motor 6–10 A", "Schneider Electric", "GV2ME14", "Proteção", 9, 6, 41.6, "A1-05"),
  a("a06", "EL01022", "Contacto auxiliar para disjuntor-motor", "Schneider Electric", "GVAE11", "Proteção", 20, 8, 9.8, "A1-05"),
  a("a07", "EL01030", "Contactor 9 A, bobina 24 V DC", "Schneider Electric", "LC1D09BD", "Comando", 16, 8, 34.7, "A2-01"),
  a("a08", "EL01031", "Contactor 18 A, bobina 24 V DC", "Schneider Electric", "LC1D18BD", "Comando", 7, 6, 52.3, "A2-01"),
  a("a09", "EL01040", "Relé de interface 24 V DC, 1 C/O", "Finder", "38.51.7.024.0050", "Relés", 60, 20, 6.4, "A2-02"),
  a("a10", "EL01041", "Relé temporizado multifunções", "Finder", "80.01.0.240.0000", "Relés", 5, 4, 31.9, "A2-02"),
  a("a11", "EL01050", "Autómato compacto CPU 1214C DC/DC/DC", "Siemens", "6ES7214-1AG40-0XB0", "Automação", 3, 2, 395, "B1-01"),
  a("a12", "EL01051", "Módulo de 4 entradas analógicas", "Siemens", "6ES7231-4HD32-0XB0", "Automação", 4, 2, 268, "B1-01"),
  a("a13", "EL01052", "Módulo RTD 4 × PT100", "Siemens", "6ES7231-5PD32-0XB0", "Automação", 2, 2, 342, "B1-01"),
  a("a14", "EL01053", "Painel HMI tátil 7\"", "Siemens", "6AV2123-2GB03-0AX0", "Automação", 2, 1, 610, "B1-02"),
  a("a15", "EL01054", "Switch Ethernet não gerido 5 portas", "Phoenix Contact", "1085039", "Automação", 5, 2, 88, "B1-02"),
  a("a16", "EL01060", "Fonte de alimentação 24 V DC 5 A", "Phoenix Contact", "2904376", "Alimentação", 6, 3, 74.5, "B2-01"),
  a("a17", "EL01061", "Transformador de comando 400/230 V 250 VA", "Legrand", "042807", "Alimentação", 5, 2, 69, "B2-01"),
  a("a18", "EL01070", "Variador de frequência 3 kW 400 V", "Danfoss", "132F0024", "Variadores", 2, 1, 485, "B3-01"),
  a("a19", "EL01071", "Variador de frequência 1,5 kW 400 V", "Danfoss", "132F0022", "Variadores", 0, 1, 372, "B3-01"),
  a("a20", "EL01072", "Variador de frequência 0,75 kW 400 V", "Danfoss", "132F0018", "Variadores", 3, 1, 298, "B3-01"),
  a("a21", "EL01080", "Sonda PT100 com bainha 150 mm", "Instrutécnica", "PT100-B150", "Instrumentação", 8, 6, 46, "C1-01"),
  a("a22", "EL01081", "Transmissor de pressão 0–16 bar, 4–20 mA", "Danfoss", "060G1124", "Instrumentação", 2, 2, 158, "C1-01"),
  a("a23", "EL01082", "Controlador de nível com elétrodos", "Omron", "61F-G-AP", "Instrumentação", 4, 2, 96, "C1-02"),
  a("a24", "EL01083", "Termóstato de segurança 30–120 °C", "Instrutécnica", "TS-120", "Instrumentação", 6, 4, 39, "C1-02"),
  a("a25", "EL01084", "Pressostato de segurança com rearme manual", "Danfoss", "060-110566", "Instrumentação", 3, 2, 112, "C1-03"),
  a("a26", "EL01090", "Botão de emergência tipo cogumelo", "Schneider Electric", "XB5AS8442", "Sinalização", 12, 6, 21.3, "C2-01"),
  a("a27", "EL01091", "Sinalizador LED verde 24 V", "Schneider Electric", "XB5AVB3", "Sinalização", 30, 10, 5.8, "C2-01"),
  a("a28", "EL01092", "Sinalizador LED vermelho 24 V", "Schneider Electric", "XB5AVB4", "Sinalização", 28, 10, 5.8, "C2-01"),
  a("a29", "EL01093", "Comutador 3 posições fixas", "Schneider Electric", "XB5AD33", "Sinalização", 14, 6, 12.4, "C2-02"),
  a("a30", "EL01094", "Sirene de alarme 24 V", "Schneider Electric", "XVS10BMW", "Sinalização", 4, 3, 27.5, "C2-02"),
  a("a31", "EL01100", "Borne de passagem 2,5 mm²", "Weidmüller", "1020000000", "Cablagem", 600, 300, 0.62, "D1-01"),
  a("a32", "EL01101", "Borne de terra 2,5 mm²", "Weidmüller", "1010000000", "Cablagem", 180, 100, 1.85, "D1-01"),
  a("a33", "EL01102", "Calha DIN 35 mm (2 m)", "Weidmüller", "0514500000", "Cablagem", 20, 10, 4.2, "D1-02"),
  a("a34", "EL01103", "Calha técnica 60 × 80 mm (2 m)", "Legrand", "036414", "Cablagem", 24, 10, 9.6, "D1-02"),
  a("a35", "EL01110", "Armário metálico 1000 × 800 × 300 mm", "Rittal", "1280.500", "Envolventes", 2, 2, 465, "E1-01"),
  a("a36", "EL01111", "Armário metálico 600 × 600 × 250 mm", "Rittal", "1060.500", "Envolventes", 3, 2, 248, "E1-01"),
  a("a37", "EL01112", "Ventilador com filtro 230 V", "Rittal", "3238.100", "Envolventes", 7, 3, 63, "E1-02"),
  a("a38", "EL01113", "Termóstato de armário", "Rittal", "3110.000", "Envolventes", 6, 3, 24.5, "E1-02"),
];

export const fornecedores: Fornecedor[] = [
  { codigo: "F001", nome: "Eletrodistribuição do Norte, Lda", nif: "507 331 902", email: "encomendas@eletronorte.exemplo.pt", telefone: "229 000 101", prazoMedio: 3 },
  { codigo: "F002", nome: "Automação Industrial Lusa, S.A.", nif: "505 118 447", email: "vendas@ailusa.exemplo.pt", telefone: "220 000 202", prazoMedio: 10 },
  { codigo: "F003", nome: "Cabos & Componentes Maia, Lda", nif: "509 664 013", email: "geral@ccmaia.exemplo.pt", telefone: "229 000 303", prazoMedio: 5 },
  { codigo: "F004", nome: "Instrumentação Técnica Ibérica, Lda", nif: "510 207 588", email: "comercial@iti.exemplo.pt", telefone: "234 000 404", prazoMedio: 14 },
  { codigo: "F005", nome: "Armários Elétricos Gaia, Lda", nif: "511 940 276", email: "pedidos@aegaia.exemplo.pt", telefone: "227 000 505", prazoMedio: 7 },
];

let n = 0;
const l = (artigoId: string | null, designacao: string, quantidade: number, extra?: Partial<LinhaMaterial>): LinhaMaterial => {
  const art = artigos.find((x) => x.id === artigoId);
  n += 1;
  return {
    id: `l${String(n).padStart(3, "0")}`,
    artigoId,
    refExtraida: art?.referencia ?? "",
    descricaoExtraida: art?.descricao ?? "",
    fabricante: art?.marca ?? "",
    designacao,
    quantidade,
    ...extra,
  };
};

const base = (prefix: string) => [
  l("a03", `${prefix}-Q0`, 1),
  l("a16", `${prefix}-G1`, 1),
  l("a17", `${prefix}-T1`, 1),
  l("a26", `${prefix}-S0`, 1),
  l("a27", `${prefix}-H1..H4`, 2),
  l("a28", `${prefix}-H5..H8`, 2),
  l("a29", `${prefix}-S1..S2`, 2),
  l("a31", `${prefix}-X1`, 80),
  l("a32", `${prefix}-PE`, 16),
  l("a33", "Montagem", 2),
  l("a34", "Montagem", 3),
  l("a37", `${prefix}-E1`, 1),
];

export const quadros: Quadro[] = [
  {
    id: "q024", codigo: "QE-OE864-EL-001", descricao: "Quadro elétrico — caldeira Turbovap 1200", oe: 864, nf: "1101/1", cliente: "Lacticínios Vale do Zêzere, Lda",
    esquema: "SEE-864-001", revisao: "R02", pdf: "QE-OE864-EL-001_R02.pdf", extraidoEm: "2026-06-25",
    linhas: [l("a35", "=QE+A1", 1), ...base("=QE"), l("a01", "-Q1..Q2", 2), l("a02", "-F1..F4", 4), l("a04", "-QM1..QM2", 2), l("a05", "-QM3", 1), l("a07", "-KM1..KM3", 3), l("a09", "-K1..K10", 10), l("a11", "-A1", 1), l("a12", "-A2", 1), l("a14", "-HMI1", 1), l("a23", "-B1", 1), l("a25", "-B2", 1), l("a30", "-H9", 1)],
  },
  {
    id: "q028", codigo: "QE-OE868-EL-001", descricao: "Quadro comum — termoacumuladores 5000 L", oe: 868, nf: "1110", cliente: "Cerâmica Ribeira Nova, S.A.",
    esquema: "SEE-868-001", revisao: "R01", pdf: "QE-OE868-EL-001_R01.pdf", extraidoEm: "2026-08-12",
    linhas: [l("a35", "=QE+A1", 1), ...base("=QE"), l("a01", "-Q1..Q2", 2), l("a02", "-F1..F4", 4), l("a04", "-QM1..QM2", 2), l("a07", "-KM1..KM2", 2), l("a09", "-K1..K8", 8), l("a11", "-A1", 1), l("a13", "-A2", 1), l("a21", "-B1..B2", 2), l("a24", "-B3..B4", 2)],
  },
  {
    id: "q030", codigo: "QE-OE871-EL-001", descricao: "Quadro de controlo — permutador AQS", oe: 871, nf: "1117", cliente: "Hotel Miramar Douro",
    esquema: "SEE-871-001", revisao: "R00", pdf: "QE-OE871-EL-001_R00.pdf", extraidoEm: "2026-09-03",
    linhas: [l("a36", "=QE+A1", 1), ...base("=QE"), l("a01", "-Q1", 1), l("a02", "-F1..F3", 3), l("a19", "-TA1", 1), l("a07", "-KM1", 1), l("a09", "-K1..K6", 6), l("a11", "-A1", 1), l("a13", "-A2", 1), l("a14", "-HMI1", 1), l("a21", "-B1..B2", 2), l("a22", "-B3", 1)],
  },
  {
    id: "q031", codigo: "QE-OE870-EL-005", descricao: "Quadro elétrico — caldeira Turbovap 2000", oe: 870, nf: "1112/2", cliente: "Conservas Atlântico Norte, S.A.",
    esquema: "SEE-870-005", revisao: "R01", pdf: "QE-OE870-EL-005_R01.pdf", extraidoEm: "2026-09-12",
    linhas: [l("a35", "=QE+A1", 1), ...base("=QE"), l("a01", "-Q1..Q3", 3), l("a02", "-F1..F6", 6), l("a05", "-QM1", 1), l("a18", "-TA1..TA2", 2), l("a07", "-KM1..KM2", 2), l("a09", "-K1..K12", 12), l("a11", "-A1", 1), l("a12", "-A2", 1), l("a14", "-HMI1", 1), l("a15", "-N1", 1), l("a22", "-B1", 1), l("a23", "-B2", 1), l("a25", "-B3", 1), l("a38", "-B9", 1)],
  },
  {
    id: "q032", codigo: "QE-OE870-EL-006", descricao: "Quadro comum — termoacumuladores 4000 L", oe: 870, nf: "1115", cliente: "Conservas Atlântico Norte, S.A.",
    esquema: "SEE-870-006", revisao: "R00", pdf: "QE-OE870-EL-006_R00.pdf",
    linhas: [],
  },
];

// Linhas que a "extração" simulada do PDF SEE devolve para o quadro q032.
// Duas referências não existem no cadastro, para demonstrar a associação.
export function extracaoSimulada(): Omit<LinhaMaterial, "id">[] {
  const find = (ref: string) => artigos.find((x) => x.referencia === ref);
  const row = (ref: string, designacao: string, quantidade: number, desc?: string, fab?: string) => {
    const art = find(ref);
    return { artigoId: art?.id ?? null, refExtraida: ref, descricaoExtraida: art?.descricao ?? desc ?? "", fabricante: art?.marca ?? fab ?? "", designacao, quantidade };
  };
  return [
    row("1280.500", "=QE+A1", 1),
    row("VCF3", "=QE-Q0", 1),
    row("A9F74316", "-Q1..Q2", 2),
    row("A9F74106", "-F1..F4", 4),
    row("GV2ME07", "-QM1..QM2", 2),
    row("LC1D09BD", "-KM1..KM2", 2),
    row("38.51.7.024.0050", "-K1..K8", 8),
    row("6ES7214-1AG40-0XB0", "-A1", 1),
    row("6ES7231-5PD32-0XB0", "-A2", 1),
    row("6AV2123-2GB03-0AX0", "-HMI1", 1),
    row("PT100-B150", "-B1..B4", 4),
    row("TS-120", "-B5..B6", 2),
    row("2904376", "=QE-G1", 1),
    row("1020000000", "=QE-X1", 90),
    row("PM5110", "-P1", 1, "Analisador de energia trifásico", "Schneider Electric"),
    row("RM22TR33", "-K20", 1, "Relé de controlo de fases", "Schneider Electric"),
  ];
}

export const ETAPAS = ["Pedido recebido", "OIF criada", "Projeto SEE", "Materiais / stock", "Montagem", "Testes", "Devolvida à OE"] as const;

const et = (count: number, datas: string[], utilizadores: string[]) =>
  ETAPAS.slice(0, count).map((etapa, i) => ({ etapa, data: datas[i], utilizador: utilizadores[i] ?? utilizadores[utilizadores.length - 1] }));

export const oifs: OIF[] = [
  {
    numero: "OIF-2026-024", quadroId: "q024", pedido: "OE864-EL-001", oe: 864, nf: "1101/1", quantidade: 1, estado: "Concluída", responsavel: "Rui Ferreira", prazo: "2026-08-28", criadaEm: "2026-06-18",
    etapas: et(7, ["2026-06-18", "2026-06-18", "2026-06-25", "2026-07-02", "2026-08-14", "2026-08-26", "2026-09-04"], ["Sistema", "Sistema", "Rui Ferreira", "Rui Ferreira", "Carlos Teixeira", "Rui Ferreira", "Rui Ferreira"]),
    reservas: {}, custos: {}, maoObra: 1840, outrosCustos: 120, observacoes: "Ensaio funcional realizado com o cliente.",
  },
  {
    numero: "OIF-2026-028", quadroId: "q028", pedido: "OE868-EL-001", oe: 868, nf: "1110", quantidade: 1, estado: "Em montagem", responsavel: "Carlos Teixeira", prazo: "2026-10-21", criadaEm: "2026-08-07",
    etapas: et(4, ["2026-08-07", "2026-08-07", "2026-08-12", "2026-09-18"], ["Sistema", "Sistema", "Rui Ferreira", "Rui Ferreira"]),
    reservas: {}, custos: {}, maoObra: 1260, outrosCustos: 60, observacoes: "Cablagem a 70%.",
  },
  {
    numero: "OIF-2026-030", quadroId: "q030", pedido: "OE871-EL-001", oe: 871, nf: "1117", quantidade: 1, estado: "Aguarda material", responsavel: "Rui Ferreira", prazo: "2026-10-10", criadaEm: "2026-08-28",
    etapas: et(3, ["2026-08-28", "2026-08-28", "2026-09-03"], ["Sistema", "Sistema", "Rui Ferreira"]),
    reservas: {}, custos: {}, maoObra: 780, outrosCustos: 0, observacoes: "Variador de 1,5 kW encomendado (ENC-2026-041).",
  },
  {
    numero: "OIF-2026-031", quadroId: "q031", pedido: "OE870-EL-005", oe: 870, nf: "1112/2", quantidade: 1, estado: "Material reservado", responsavel: "Rui Ferreira", prazo: "2026-10-30", criadaEm: "2026-09-01",
    etapas: et(4, ["2026-09-01", "2026-09-01", "2026-09-12", "2026-09-29"], ["Sistema", "Sistema", "Rui Ferreira", "Rui Ferreira"]),
    reservas: {}, custos: {}, maoObra: 2150, outrosCustos: 180, observacoes: "",
  },
  {
    numero: "OIF-2026-032", quadroId: "q032", pedido: "OE870-EL-006", oe: 870, nf: "1115", quantidade: 1, estado: "Aberta", responsavel: "", prazo: "2026-11-13", criadaEm: "2026-10-09",
    etapas: et(2, ["2026-10-09", "2026-10-09"], ["Sistema"]),
    reservas: {}, custos: {}, maoObra: 0, outrosCustos: 0, observacoes: "",
  },
];

export const encomendas: Encomenda[] = [
  { numero: "ENC-2026-036", fornecedor: "F001", data: "2026-08-20", previsao: "2026-08-25", estado: "Recebida", linhas: [{ artigoId: "a31", quantidade: 500, preco: 0.55, recebido: 500 }, { artigoId: "a09", quantidade: 40, preco: 5.9, recebido: 40 }] },
  { numero: "ENC-2026-039", fornecedor: "F003", data: "2026-09-22", previsao: "2026-10-06", estado: "Recebida parcial", linhas: [{ artigoId: "a34", quantidade: 10, preco: 9.1, recebido: 10 }, { artigoId: "a33", quantidade: 10, preco: 3.9, recebido: 0 }] },
  { numero: "ENC-2026-040", fornecedor: "F005", data: "2026-10-02", previsao: "2026-10-24", estado: "Enviada", linhas: [{ artigoId: "a35", quantidade: 2, preco: 452, recebido: 0 }] },
  { numero: "ENC-2026-041", fornecedor: "F002", oif: "OIF-2026-030", data: "2026-10-01", previsao: "2026-10-15", estado: "Confirmada", linhas: [{ artigoId: "a19", quantidade: 1, preco: 360, recebido: 0 }, { artigoId: "a13", quantidade: 1, preco: 330, recebido: 0 }] },
  { numero: "ENC-2026-042", fornecedor: "F004", data: "2026-10-13", previsao: "2026-10-27", estado: "Rascunho", linhas: [{ artigoId: "a25", quantidade: 2, preco: 108, recebido: 0 }, { artigoId: "a22", quantidade: 2, preco: 150, recebido: 0 }] },
];

export const rececoes: Rececao[] = [
  { numero: "RC-2026-018", encomenda: "ENC-2026-036", data: "2026-08-25", guia: "GT 2026/4471", linhas: [{ artigoId: "a31", quantidade: 500 }, { artigoId: "a09", quantidade: 40 }] },
  { numero: "RC-2026-021", encomenda: "ENC-2026-039", data: "2026-10-03", guia: "GR 88213", linhas: [{ artigoId: "a34", quantidade: 10 }] },
];

const mv = (id: string, artigoId: string, tipo: Movimento["tipo"], quantidade: number, documento: string, data: string, observacoes = ""): Movimento => ({ id, artigoId, tipo, quantidade, documento, data, observacoes });

// Histórico anterior às reservas (as reservas atuais são geradas no arranque).
export const movimentosBase: Movimento[] = [
  mv("m001", "a31", "Entrada", 500, "ENC-2026-036", "2026-08-25"),
  mv("m002", "a09", "Entrada", 40, "ENC-2026-036", "2026-08-25"),
  mv("m003", "a35", "Saída", 1, "OIF-2026-024", "2026-08-14", "Consumo na montagem"),
  mv("m004", "a11", "Saída", 1, "OIF-2026-024", "2026-08-14", "Consumo na montagem"),
  mv("m005", "a14", "Saída", 1, "OIF-2026-024", "2026-08-14", "Consumo na montagem"),
  mv("m006", "a31", "Saída", 80, "OIF-2026-024", "2026-08-14", "Consumo na montagem"),
  mv("m007", "a20", "Ajuste", 1, "INV-2026-09", "2026-09-30", "Correção após inventário"),
  mv("m008", "a34", "Entrada", 10, "ENC-2026-039", "2026-10-03"),
];
