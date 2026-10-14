import type { Documento, NF, OE, PedidoEletrico } from "@/types";

// Ordens de Execução sintéticas. Os números seguem a numeração usada na
// aplicação OE, mas clientes, quantidades e datas são inventados.
export const oes: OE[] = [
  {
    numero: 864, dataCriacao: "2026-06-02", dataEntrega: "2026-09-12", clienteCodigo: "01042", cliente: "Lacticínios Vale do Zêzere, Lda",
    moradaCliente: "Rua da Fábrica, 12 · 6200-151 Covilhã", moradaInstalacao: "Unidade fabril da Covilhã", encomendaCliente: "EC-2026/118", orcamento: "ORC-26-0412",
    descricao: "Caldeira Turbovap 1200 com quadro elétrico Termovapor", responsavel: "Marta Lopes", prioridade: "Normal", estado: "Concluída",
    observacoes: "Entregue e em serviço. Dossier final enviado ao cliente.",
  },
  {
    numero: 865, dataCriacao: "2026-06-09", dataEntrega: "2026-10-30", clienteCodigo: "01057", cliente: "Panificadora Central do Mondego, Lda",
    moradaCliente: "Estrada Nacional 17, km 4 · 3020-210 Coimbra", moradaInstalacao: "Igual à morada do cliente", encomendaCliente: "—", orcamento: "ORC-26-0431",
    descricao: "Caldeira Vapobloc 20 m² (anulada pelo cliente)", responsavel: "Ana Sousa", prioridade: "Normal", estado: "Anulada",
    observacoes: "Cliente anulou a encomenda. NF 1103 mantém-se reservado e não volta a ser atribuído.",
  },
  {
    numero: 866, dataCriacao: "2026-06-17", dataEntrega: "2026-07-24", clienteCodigo: "01088", cliente: "Têxteis Rio Vizela, S.A.",
    moradaCliente: "Avenida Industrial, 340 · 4815-433 Vizela", moradaInstalacao: "Central térmica — nave 2", encomendaCliente: "PO 7781", orcamento: "ORC-26-0450",
    descricao: "Substituição parcial do feixe tubular de caldeira existente", responsavel: "Nuno Barros", prioridade: "Urgente", estado: "Fechada",
    observacoes: "Intervenção concluída com ensaio hidráulico aprovado.",
  },
  {
    numero: 868, dataCriacao: "2026-07-06", dataEntrega: "2026-10-28", clienteCodigo: "01103", cliente: "Cerâmica Ribeira Nova, S.A.",
    moradaCliente: "Zona Industrial de Ribeira Nova, Lote 8 · 3780-209 Anadia", moradaInstalacao: "Pavilhão de esmaltagem", encomendaCliente: "ENC-0921", orcamento: "ORC-26-0477",
    descricao: "Dois termoacumuladores de 5000 L com quadro elétrico comum", responsavel: "Marta Lopes", prioridade: "Normal", estado: "Em execução",
    observacoes: "",
  },
  {
    numero: 869, dataCriacao: "2026-07-14", dataEntrega: "2026-11-20", clienteCodigo: "01126", cliente: "Queijaria Monte Pastor, Lda",
    moradaCliente: "Lugar do Outeiro, s/n · 6270-012 Seia", moradaInstalacao: "Sala de cura", encomendaCliente: "—", orcamento: "ORC-26-0489",
    descricao: "Permutador tubular para aquecimento de salmoura", responsavel: "Ana Sousa", prioridade: "Normal", estado: "Suspensa",
    observacoes: "Suspensa a pedido do cliente até aprovação do licenciamento.",
  },
  {
    numero: 870, dataCriacao: "2026-07-21", dataEntrega: "2026-11-06", clienteCodigo: "01134", cliente: "Conservas Atlântico Norte, S.A.",
    moradaCliente: "Rua do Cais Novo, 55 · 4490-410 Póvoa de Varzim", moradaInstalacao: "Nova central de vapor — edifício C", encomendaCliente: "PO-2026-0332", orcamento: "ORC-26-0495",
    descricao: "Central de vapor: caldeira Turbovap 2000, economizador e dois termoacumuladores", responsavel: "Nuno Barros", prioridade: "Urgente", estado: "Em execução",
    observacoes: "Montagem em obra prevista para a semana 45. Coordenar transporte especial.",
  },
  {
    numero: 871, dataCriacao: "2026-08-04", dataEntrega: "2026-10-23", clienteCodigo: "01159", cliente: "Hotel Miramar Douro",
    moradaCliente: "Avenida Ribeirinha, 101 · 5050-237 Peso da Régua", moradaInstalacao: "Casa das máquinas — piso -1", encomendaCliente: "Adj. 44/2026", orcamento: "ORC-26-0503",
    descricao: "Permutador de placas para AQS com quadro de controlo", responsavel: "Ana Sousa", prioridade: "Normal", estado: "Aguarda material",
    observacoes: "Aguarda variador de frequência para o quadro.",
  },
  {
    numero: 872, dataCriacao: "2026-08-25", dataEntrega: "2026-12-11", clienteCodigo: "01172", cliente: "Destilaria Quinta do Freixo, Lda",
    moradaCliente: "Quinta do Freixo, Estrada Municipal 512 · 5100-330 Lamego", moradaInstalacao: "Adega de destilação", encomendaCliente: "EF-118", orcamento: "ORC-26-0518",
    descricao: "Caldeira Vapobloc 40 m² com quadro elétrico", responsavel: "Marta Lopes", prioridade: "Normal", estado: "Em preparação",
    observacoes: "",
  },
  {
    numero: 873, dataCriacao: "2026-09-08", dataEntrega: "2026-10-17", clienteCodigo: "01198", cliente: "Carnes Planalto, S.A.",
    moradaCliente: "Parque Empresarial do Planalto, Pavilhão 3 · 5300-358 Bragança", moradaInstalacao: "Central térmica", encomendaCliente: "OS-5520", orcamento: "—",
    descricao: "Assistência ao queimador e afinação de combustão", responsavel: "Nuno Barros", prioridade: "Urgente", estado: "Em execução",
    observacoes: "Deslocação técnica agendada.",
  },
  {
    numero: 874, dataCriacao: "2026-09-15", dataEntrega: "2026-12-18", clienteCodigo: "01205", cliente: "Lavandaria Industrial do Sado, Lda",
    moradaCliente: "Rua das Salinas, 21 · 2900-511 Setúbal", moradaInstalacao: "Igual à morada do cliente", encomendaCliente: "N.º 2026/77", orcamento: "ORC-26-0540",
    descricao: "Caldeira Turbovap 900 com quadro elétrico Termovapor", responsavel: "Ana Sousa", prioridade: "Normal", estado: "Em preparação",
    observacoes: "",
  },
  {
    numero: 875, dataCriacao: "2026-09-29", dataEntrega: "2027-01-15", clienteCodigo: "01231", cliente: "Papel & Cartão do Vouga, S.A.",
    moradaCliente: "Zona Industrial de Cacia, Rua C · 3800-533 Aveiro", moradaInstalacao: "Linha de secagem 2", encomendaCliente: "PC-26-1190", orcamento: "ORC-26-0552",
    descricao: "Economizador e coletor de distribuição de vapor", responsavel: "Marta Lopes", prioridade: "Normal", estado: "Nova",
    observacoes: "",
  },
  {
    numero: 876, dataCriacao: "2026-10-06", dataEntrega: "2026-11-27", clienteCodigo: "01244", cliente: "Clínica Termal das Caldas Novas",
    moradaCliente: "Largo das Termas, 2 · 3500-190 Viseu", moradaInstalacao: "Balneário — zona técnica", encomendaCliente: "Req. 31", orcamento: "ORC-26-0561",
    descricao: "Termoacumulador de 3000 L em AISI 316", responsavel: "Nuno Barros", prioridade: "Urgente", estado: "Nova",
    observacoes: "",
  },
  {
    numero: 877, dataCriacao: "2026-10-12", dataEntrega: "2026-12-04", clienteCodigo: "01267", cliente: "Cervejaria Artesanal Ponte Velha, Lda",
    moradaCliente: "Travessa da Ponte Velha, 7 · 4900-322 Viana do Castelo", moradaInstalacao: "Sala de brassagem", encomendaCliente: "—", orcamento: "ORC-26-0570",
    descricao: "Depósito de condensados atmosférico", responsavel: "Ana Sousa", prioridade: "Normal", estado: "Nova",
    observacoes: "",
  },
];

const caldeira = (v: Record<string, string>) => v;

export const nfs: NF[] = [
  {
    numero: "1101", oe: 864, tipo: "Caldeira", registoTipo: "Equipamento novo", designacao: "Caldeira Turbovap 1200", estado: "Concluído",
    campos: caldeira({ familia: "Turbovap", modelo: "1200", producao: "1200", pressao_servico: "8", pressao_projeto: "10", combustivel: "Gás natural", bomba_marca: "Speck", bomba_modelo: "MX-25", bomba_qtd: "2", bomba_motor_kw: "2,2", bomba_arranque: "Direto", queimador_modelo: "Monobloco gás 900 kW", valvula_seguranca: "Sim", valvula_calibracao: "10", pressostato_servico: "Sim", pressostato_seguranca: "Sim", quadro: "Termovapor", economizador: "Não", separador_vapor: "Sim", chamine: "Sim", deposito_condensados: "Sim", termoacumulador: "Não", tratamento_agua: "Sim", coletor: "Não", el_hmi: "Com HMI", el_alimentacao: "400 V · 3~ · 50 Hz", el_motores: "2 × bomba de alimentação 2,2 kW\nVentilador do queimador 1,1 kW", el_sondas_qtd: "4", el_sondas: "Sonda de nível contínua\n2 × sonda de nível mínimo\nSonda de condutividade", el_oif: "OIF-2026-024" }),
  },
  { numero: "1101/1", principal: "1101", oe: 864, tipo: "Quadro elétrico", registoTipo: "Componente novo", designacao: "Quadro elétrico da caldeira", estado: "Concluído", campos: { equipamento: "Caldeira Turbovap 1200", execucao: "Termovapor", ip: "IP55", el_hmi: "Com HMI", el_alimentacao: "400 V · 3~ · 50 Hz", el_oif: "OIF-2026-024" } },
  { numero: "1103", oe: 865, tipo: "Caldeira", registoTipo: "Equipamento novo", designacao: "Caldeira Vapobloc 20 m²", estado: "Anulado", campos: { familia: "Vapobloc", modelo: "20 m²", combustivel: "Gasóleo" } },
  { numero: "1104", oe: 866, tipo: "Caldeira", registoTipo: "Reparação / intervenção", designacao: "Substituição parcial do feixe tubular", estado: "Concluído", campos: { equipamento_existente: "Caldeira fogotubular 3 t/h (n.º série 7731)", trabalho: "Substituição de 48 tubos de fumo e mandrilagem", extensao: "Parcial", ensaios: "Ensaio hidráulico a 1,5 × PS" } },
  { numero: "1108", oe: 868, tipo: "Termoacumulador", registoTipo: "Equipamento novo", designacao: "Termoacumulador 1 — 5000 L", estado: "Em fabrico", campos: { desenho: "DES-868-01", tipo: "Vertical", capacidade: "5000", pressao_projeto: "6", temperatura: "90", material: "AISI 304", diametro: "1600", altura: "3100", isolamento: "Sim", revestimento: "Alumínio", permutadores_qtd: "1", area: "6,5", potencia: "320", valvula_tipo: "3 vias", valvula_dn: "DN40", valvula_sinal: "0-10 V", el_config: "Comum a vários termoacumuladores" } },
  { numero: "1109", oe: 868, tipo: "Termoacumulador", registoTipo: "Equipamento novo", designacao: "Termoacumulador 2 — 5000 L", estado: "Em fabrico", campos: { desenho: "DES-868-01", tipo: "Vertical", capacidade: "5000", pressao_projeto: "6", temperatura: "90", material: "AISI 304", diametro: "1600", altura: "3100", isolamento: "Sim", revestimento: "Alumínio", permutadores_qtd: "1", area: "6,5", potencia: "320", valvula_tipo: "3 vias", valvula_dn: "DN40", valvula_sinal: "0-10 V", el_config: "Comum a vários termoacumuladores" } },
  { numero: "1110", oe: 868, tipo: "Quadro elétrico", registoTipo: "Componente novo", designacao: "Quadro comum dos termoacumuladores", estado: "Em fabrico", campos: { equipamento: "Termoacumuladores NF 1108 e NF 1109", execucao: "Termovapor", ip: "IP55", el_hmi: "Sem HMI", el_alimentacao: "400 V · 3~ · 50 Hz", el_motores: "2 × bomba de recirculação 0,75 kW", el_sondas_qtd: "4", el_sondas: "2 × PT100 de controlo\n2 × termóstato de segurança", el_oif: "OIF-2026-028" } },
  { numero: "1111", oe: 869, tipo: "Permutador", registoTipo: "Equipamento novo", designacao: "Permutador tubular para salmoura", estado: "Definição", campos: { tipo: "Tubular", potencia: "85", fluido_primario: "Água quente 80 °C", fluido_secundario: "Salmoura", material_casco: "AISI 316", material_tubos: "AISI 316" } },
  {
    numero: "1112", oe: 870, tipo: "Caldeira", registoTipo: "Equipamento novo", designacao: "Caldeira Turbovap 2000", estado: "Em fabrico",
    campos: caldeira({ familia: "Turbovap", modelo: "2000", producao: "2000", pressao_servico: "10", pressao_projeto: "12", combustivel: "Gás natural", bomba_marca: "Grundfos", bomba_modelo: "CR 5-15", bomba_qtd: "2", bomba_motor_kw: "3", bomba_arranque: "Variador", queimador_modelo: "Modulante gás 1500 kW", valvula_seguranca: "Sim", valvula_calibracao: "12", pressostato_servico: "Sim", pressostato_seguranca: "Sim", quadro: "Termovapor", economizador: "Sim", separador_vapor: "Sim", chamine: "Sim", deposito_condensados: "Sim", termoacumulador: "Sim", tratamento_agua: "Sim", coletor: "Sim", observacoes: "Termoacumuladores convertidos em NF principais próprios (NF 1113 e NF 1114).", el_hmi: "Com HMI", el_alimentacao: "400 V · 3~ · 50 Hz", el_motores: "2 × bomba de alimentação 3 kW (variador)\nVentilador do queimador 2,2 kW", el_sondas_qtd: "5", el_sondas: "Sonda de nível contínua\n2 × sonda de nível mínimo\nTransmissor de pressão 0–16 bar\nSonda de condutividade", el_oif: "OIF-2026-031" }),
  },
  { numero: "1112/2", principal: "1112", oe: 870, tipo: "Quadro elétrico", registoTipo: "Componente novo", designacao: "Quadro elétrico da caldeira", estado: "Em preparação", campos: { equipamento: "Caldeira Turbovap 2000", execucao: "Termovapor", ip: "IP55", el_hmi: "Com HMI", el_alimentacao: "400 V · 3~ · 50 Hz", el_oif: "OIF-2026-031" } },
  { numero: "1112/3", principal: "1112", oe: 870, tipo: "Economizador", registoTipo: "Componente novo", designacao: "Economizador de gases de combustão", estado: "Em fabrico", campos: { potencia: "110", material: "AISI 304" } },
  { numero: "1113", oe: 870, tipo: "Termoacumulador", registoTipo: "Equipamento novo", designacao: "Termoacumulador 1 — 4000 L", estado: "Em preparação", campos: { desenho: "DES-870-04", tipo: "Vertical", capacidade: "4000", pressao_projeto: "6", temperatura: "85", material: "AISI 316", diametro: "1500", altura: "2800", isolamento: "Sim", revestimento: "Inox", permutadores_qtd: "2", area: "8,2", potencia: "410", valvula_tipo: "3 vias", valvula_dn: "DN50", valvula_sinal: "4-20 mA", el_config: "Comum a vários termoacumuladores" } },
  { numero: "1114", oe: 870, tipo: "Termoacumulador", registoTipo: "Equipamento novo", designacao: "Termoacumulador 2 — 4000 L", estado: "Em preparação", campos: { desenho: "DES-870-04", tipo: "Vertical", capacidade: "4000", pressao_projeto: "6", temperatura: "85", material: "AISI 316", diametro: "1500", altura: "2800", isolamento: "Sim", revestimento: "Inox", permutadores_qtd: "2", area: "8,2", potencia: "410", valvula_tipo: "3 vias", valvula_dn: "DN50", valvula_sinal: "4-20 mA", el_config: "Comum a vários termoacumuladores" } },
  { numero: "1115", oe: 870, tipo: "Quadro elétrico", registoTipo: "Componente novo", designacao: "Quadro comum dos termoacumuladores", estado: "Definição", campos: { equipamento: "Termoacumuladores NF 1113 e NF 1114", execucao: "Termovapor", ip: "IP55", el_hmi: "Com HMI", el_alimentacao: "400 V · 3~ · 50 Hz", el_motores: "2 × bomba de carga 1,1 kW", el_sondas_qtd: "6", el_sondas: "4 × PT100\n2 × termóstato de segurança", el_oif: "OIF-2026-032" } },
  { numero: "1116", oe: 871, tipo: "Permutador", registoTipo: "Equipamento novo", designacao: "Permutador de placas AQS", estado: "Aguarda material", campos: { tipo: "Placas", potencia: "250", fluido_primario: "Água sobreaquecida", fluido_secundario: "AQS", pressao_primario: "6", pressao_secundario: "6", material_casco: "AISI 316", material_tubos: "AISI 316", flange_dn: "DN65", flange_pn: "PN16" } },
  { numero: "1117", oe: 871, tipo: "Quadro elétrico", registoTipo: "Componente novo", designacao: "Quadro de controlo do permutador", estado: "Aguarda material", campos: { equipamento: "Permutador NF 1116", execucao: "Termovapor", ip: "IP54", el_hmi: "Com HMI", el_alimentacao: "400 V · 3~ · 50 Hz", el_motores: "Bomba primária 1,5 kW (variador)", el_sondas_qtd: "3", el_sondas: "2 × PT100\nTransmissor de pressão", el_oif: "OIF-2026-030" } },
  { numero: "1118", oe: 872, tipo: "Caldeira", registoTipo: "Equipamento novo", designacao: "Caldeira Vapobloc 40 m²", estado: "Definição", campos: { familia: "Vapobloc", modelo: "40 m²", producao: "1600", pressao_servico: "8", pressao_projeto: "10", combustivel: "Biogás", quadro: "Termovapor", valvula_seguranca: "Sim", el_hmi: "Com HMI", el_alimentacao: "400 V · 3~ · 50 Hz", el_motores: "2 × bomba de alimentação 2,2 kW", el_sondas_qtd: "4" } },
  { numero: "1118/1", principal: "1118", oe: 872, tipo: "Quadro elétrico", registoTipo: "Componente novo", designacao: "Quadro elétrico da caldeira", estado: "Definição", campos: { equipamento: "Caldeira Vapobloc 40 m²", execucao: "Termovapor", ip: "IP55" } },
  { numero: "1119", oe: 873, tipo: "Outro", registoTipo: "Assistência / manutenção", designacao: "Assistência ao queimador", estado: "Em preparação", campos: { equipamento_existente: "Caldeira Turbovap 1500 (NF 0987)", trabalho: "Verificação do queimador, substituição do elétrodo de ignição e afinação de combustão", extensao: "Parcial", ensaios: "Análise de gases de combustão" } },
  { numero: "1120", oe: 874, tipo: "Caldeira", registoTipo: "Equipamento novo", designacao: "Caldeira Turbovap 900", estado: "Definição", campos: { familia: "Turbovap", modelo: "900", producao: "900", pressao_servico: "8", combustivel: "GPL", quadro: "Termovapor", el_hmi: "Sem HMI", el_alimentacao: "400 V · 3~ · 50 Hz" } },
  { numero: "1120/1", principal: "1120", oe: 874, tipo: "Quadro elétrico", registoTipo: "Componente novo", designacao: "Quadro elétrico da caldeira", estado: "Definição", campos: { equipamento: "Caldeira Turbovap 900", execucao: "Termovapor", ip: "IP55" } },
  { numero: "1121", oe: 875, tipo: "Economizador", registoTipo: "Equipamento novo", designacao: "Economizador para caldeira existente", estado: "Definição", campos: { potencia: "140", material: "AISI 316" } },
  { numero: "1122", oe: 875, tipo: "Coletor", registoTipo: "Equipamento novo", designacao: "Coletor de distribuição de vapor", estado: "Definição", campos: { servico: "Vapor saturado 10 bar", diametro: "323,9", saidas: "5 × DN80", material: "Aço carbono" } },
  { numero: "1123", oe: 876, tipo: "Termoacumulador", registoTipo: "Equipamento novo", designacao: "Termoacumulador 3000 L", estado: "Definição", campos: { tipo: "Vertical", capacidade: "3000", material: "AISI 316" } },
  { numero: "1124", oe: 877, tipo: "Depósito de condensados", registoTipo: "Equipamento novo", designacao: "Depósito de condensados 1500 L", estado: "Definição", campos: { servico: "Atmosférico", capacidade: "1500", material: "AISI 304", isolamento: "Sim" } },
];

const d = (id: string, oe: number, categoria: Documento["categoria"], descricao: string, nome: string, data: string, paginas: number, nf?: string): Documento => ({ id, oe, nf, categoria, descricao, nome, data, paginas });

export const documentos: Documento[] = [
  d("doc-01", 864, "Desenhos", "Desenho de conjunto da caldeira", "DES-864-01_Turbovap1200_conjunto.pdf", "2026-06-10", 3, "1101"),
  d("doc-02", 864, "Certificados", "Certificado de materiais — chapa P265GH", "CERT-3.1_chapa_P265GH_lote4471.pdf", "2026-07-02", 2, "1101"),
  d("doc-03", 864, "Inspeções / ensaios", "Relatório de ensaio hidráulico", "ENS-864_hidraulico.pdf", "2026-08-20", 4, "1101"),
  d("doc-04", 864, "Elétrica / automação", "Esquema elétrico devolvido pelo OIF (R02)", "OE864-EL-001_R02.pdf", "2026-09-04", 22, "1101/1"),
  d("doc-05", 864, "Documentação cliente", "Manual de utilização e manutenção", "Manual_Turbovap_1200_PT.pdf", "2026-09-10", 38),
  d("doc-06", 866, "Inspeções / ensaios", "Relatório de ensaio hidráulico após reparação", "ENS-866_hidraulico.pdf", "2026-07-22", 3, "1104"),
  d("doc-07", 868, "Desenhos", "Desenho dos termoacumuladores 5000 L", "DES-868-01_TA5000.pdf", "2026-07-15", 2, "1108"),
  d("doc-08", 868, "Cálculos", "Cálculo de espessuras (EN 13445)", "CALC-868-01_espessuras.pdf", "2026-07-17", 6, "1108"),
  d("doc-09", 868, "Certificados", "Certificado de materiais — AISI 304", "CERT-3.1_AISI304_lote9921.pdf", "2026-08-03", 2, "1109"),
  d("doc-10", 870, "Geral OE", "Nota de encomenda do cliente", "PO-2026-0332_Conservas_Atlantico.pdf", "2026-07-21", 2),
  d("doc-11", 870, "Desenhos", "Desenho de conjunto da caldeira Turbovap 2000", "DES-870-01_Turbovap2000_conjunto.pdf", "2026-08-01", 4, "1112"),
  d("doc-12", 870, "Cálculos", "Cálculo de espessuras do corpo e espelhos", "CALC-870-01_corpo_espelhos.pdf", "2026-08-05", 9, "1112"),
  d("doc-13", 870, "Desenhos", "Desenho dos termoacumuladores 4000 L", "DES-870-04_TA4000.pdf", "2026-08-12", 2, "1113"),
  d("doc-14", 870, "Certificados", "Certificado de materiais — tubo P235GH", "CERT-3.1_tubo_P235GH_lote2210.pdf", "2026-09-02", 2, "1112"),
  d("doc-15", 870, "Manuais / fichas técnicas", "Ficha técnica do queimador modulante", "FT_queimador_modulante_1500kW.pdf", "2026-09-09", 12, "1112"),
  d("doc-16", 871, "Desenhos", "Esquema hidráulico do permutador", "DES-871-01_permutador_placas.pdf", "2026-08-11", 1, "1116"),
  d("doc-17", 871, "Manuais / fichas técnicas", "Ficha técnica do permutador de placas", "FT_permutador_placas_250kW.pdf", "2026-08-14", 6, "1116"),
  d("doc-18", 872, "Geral OE", "Proposta adjudicada", "ORC-26-0518_adjudicado.pdf", "2026-08-25", 5),
  d("doc-19", 874, "Geral OE", "Nota de encomenda do cliente", "Encomenda_2026-77.pdf", "2026-09-15", 1),
];

export const pedidos: PedidoEletrico[] = [
  {
    codigo: "OE864-EL-001", oe: 864, titulo: "Quadro elétrico — caldeira Turbovap 1200", quadroNf: "1101/1", nfs: ["1101"], hmi: "Com HMI",
    alimentacao: "400 V · 3~ · 50 Hz", motores: "2 × bomba 2,2 kW (arranque direto); ventilador 1,1 kW", sondas: "Nível contínuo, 2 × nível mínimo, condutividade",
    requisitos: "Comando local e remoto. Sinal de alarme geral para o autómato do cliente.", estado: "Devolvido à OE", revisao: 2, oif: "OIF-2026-024",
    dataEnvio: "2026-06-18", dataDevolucao: "2026-09-04", definicaoFinal: "Quadro ensaiado e entregue. Esquema R02 anexado à OE.",
  },
  {
    codigo: "OE868-EL-001", oe: 868, titulo: "Quadro comum — termoacumuladores 5000 L", quadroNf: "1110", nfs: ["1108", "1109"], hmi: "Sem HMI",
    alimentacao: "400 V · 3~ · 50 Hz", motores: "2 × bomba de recirculação 0,75 kW", sondas: "2 × PT100 de controlo, 2 × termóstato de segurança",
    requisitos: "Controlo independente de temperatura por termoacumulador. Prioridade ao TA1.", estado: "Em execução", revisao: 1, oif: "OIF-2026-028", dataEnvio: "2026-08-07",
  },
  {
    codigo: "OE870-EL-005", oe: 870, titulo: "Quadro elétrico — caldeira Turbovap 2000", quadroNf: "1112/2", nfs: ["1112", "1112/3"], hmi: "Com HMI",
    alimentacao: "400 V · 3~ · 50 Hz", motores: "2 × bomba 3 kW com variador; ventilador 2,2 kW", sondas: "Nível contínuo, 2 × nível mínimo, pressão 0–16 bar, condutividade",
    requisitos: "Integração Modbus TCP com a supervisão do cliente. Economizador com by-pass automático.", estado: "Em execução", revisao: 1, oif: "OIF-2026-031", dataEnvio: "2026-09-01",
  },
  {
    codigo: "OE870-EL-006", oe: 870, titulo: "Quadro comum — termoacumuladores 4000 L", quadroNf: "1115", nfs: ["1113", "1114"], hmi: "Com HMI",
    alimentacao: "400 V · 3~ · 50 Hz", motores: "2 × bomba de carga 1,1 kW", sondas: "4 × PT100, 2 × termóstato de segurança",
    requisitos: "Ciclo anti-legionela semanal programável no HMI.", estado: "Enviado ao OIF", revisao: 0, oif: "OIF-2026-032", dataEnvio: "2026-10-09",
  },
  {
    codigo: "OE871-EL-001", oe: 871, titulo: "Quadro de controlo — permutador AQS", quadroNf: "1117", nfs: ["1116"], hmi: "Com HMI",
    alimentacao: "400 V · 3~ · 50 Hz", motores: "Bomba primária 1,5 kW com variador", sondas: "2 × PT100, transmissor de pressão",
    requisitos: "Regulação PID da temperatura de AQS a 60 °C.", estado: "Em execução", revisao: 0, oif: "OIF-2026-030", dataEnvio: "2026-08-28",
  },
  {
    codigo: "OE872-EL-001", oe: 872, titulo: "Quadro elétrico — caldeira Vapobloc 40 m²", quadroNf: "1118/1", nfs: ["1118"], hmi: "Com HMI",
    alimentacao: "400 V · 3~ · 50 Hz", motores: "2 × bomba de alimentação 2,2 kW", sondas: "Nível contínuo, 2 × nível mínimo, pressão",
    requisitos: "Queimador a biogás com rampa dupla. Confirmar sinais com o fornecedor do queimador.", estado: "Não enviado", revisao: 0,
  },
  {
    codigo: "OE874-EL-001", oe: 874, titulo: "Quadro elétrico — caldeira Turbovap 900", quadroNf: "1120/1", nfs: ["1120"], hmi: "Sem HMI",
    alimentacao: "400 V · 3~ · 50 Hz", motores: "2 × bomba de alimentação 1,5 kW", sondas: "Nível on/off, 2 × nível mínimo",
    requisitos: "", estado: "Não enviado", revisao: 0,
  },
];
