// Modelos de definição técnica por tipo de equipamento.
// Inspirados nos formulários da aplicação OE (V1.4.x), reduzidos ao essencial
// para a demonstração. Cada campo pertence a uma secção do editor do NF.

export type FieldType = "text" | "combo" | "yesno" | "multiline";

export type FieldDef = {
  section: string;
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  electrical?: boolean; // aparece no separador "Parte elétrica / Automação"
};

const MATERIAIS = ["Aço carbono", "AISI 304", "AISI 316", "Outro"];
const SIM_NAO = ["Sim", "Não"];

export const CALDEIRA_MODELOS: Record<string, string[]> = {
  Turbovap: ["600", "900", "1200", "1500", "2000", "2500"],
  Vapobloc: ["20 m²", "40 m²", "60 m²", "80 m²", "Outro"],
  Oleobloc: ["Outro"],
  Aquatubular: ["Outro"],
};

const ELETRICA_COMUM: FieldDef[] = [
  { section: "Quadro elétrico", key: "el_hmi", label: "Interface do quadro", type: "combo", options: ["Com HMI", "Sem HMI"], electrical: true },
  { section: "Quadro elétrico", key: "el_alimentacao", label: "Alimentação (V / fases / Hz)", type: "text", electrical: true },
  { section: "Quadro elétrico", key: "el_motores", label: "Motores associados — identificação / potência (kW)", type: "multiline", electrical: true },
  { section: "Quadro elétrico", key: "el_sondas_qtd", label: "Número de sondas", type: "text", electrical: true },
  { section: "Quadro elétrico", key: "el_sondas", label: "Sondas — identificação / objetivo", type: "multiline", electrical: true },
  { section: "Quadro elétrico", key: "el_oif", label: "OIF associada", type: "text", electrical: true },
  { section: "Quadro elétrico", key: "el_obs", label: "Observações elétricas / automação", type: "multiline", electrical: true },
];

export const TEMPLATES: Record<string, FieldDef[]> = {
  Caldeira: [
    { section: "Geral", key: "familia", label: "Família", type: "combo", options: Object.keys(CALDEIRA_MODELOS) },
    { section: "Geral", key: "modelo", label: "Modelo / capacidade", type: "text" },
    { section: "Geral", key: "producao", label: "Produção nominal (kg/h)", type: "text" },
    { section: "Geral", key: "pressao_servico", label: "Pressão de serviço (bar)", type: "text" },
    { section: "Geral", key: "pressao_projeto", label: "Pressão de projeto (bar)", type: "text" },
    { section: "Geral", key: "combustivel", label: "Combustível", type: "combo", options: ["Gás natural", "GPL", "Gasóleo", "Fuelóleo", "Nafta", "Biogás", "Dual fuel", "Outro"] },
    { section: "Bomba de água", key: "bomba_marca", label: "Marca", type: "combo", options: ["Speck", "Wanner", "Grundfos", "Outra"] },
    { section: "Bomba de água", key: "bomba_modelo", label: "Modelo", type: "text" },
    { section: "Bomba de água", key: "bomba_qtd", label: "Quantidade de bombas", type: "text" },
    { section: "Bomba de água", key: "bomba_motor_kw", label: "Motor — potência (kW)", type: "text" },
    { section: "Bomba de água", key: "bomba_arranque", label: "Motor — tipo de arranque", type: "combo", options: ["Direto", "Estrela-triângulo", "Variador", "Outro"] },
    { section: "Queimador", key: "queimador_modelo", label: "Modelo do queimador", type: "text" },
    { section: "Queimador", key: "queimador_obs", label: "Observações", type: "multiline" },
    { section: "Segurança", key: "valvula_seguranca", label: "Válvula de segurança", type: "yesno", options: SIM_NAO },
    { section: "Segurança", key: "valvula_calibracao", label: "Calibração da válvula (bar)", type: "text" },
    { section: "Segurança", key: "pressostato_servico", label: "Pressostato de serviço", type: "yesno", options: SIM_NAO },
    { section: "Segurança", key: "pressostato_seguranca", label: "Pressostato de segurança", type: "yesno", options: SIM_NAO },
    { section: "Controlo", key: "quadro", label: "Quadro elétrico", type: "combo", options: ["Termovapor", "Externo", "Não incluído"] },
    { section: "Opcionais", key: "economizador", label: "Economizador", type: "yesno", options: SIM_NAO },
    { section: "Opcionais", key: "separador_vapor", label: "Separador de vapor", type: "yesno", options: SIM_NAO },
    { section: "Opcionais", key: "chamine", label: "Chaminé incluída", type: "yesno", options: SIM_NAO },
    { section: "Opcionais", key: "deposito_condensados", label: "Depósito de condensados", type: "yesno", options: SIM_NAO },
    { section: "Opcionais", key: "termoacumulador", label: "Termoacumulador incluído", type: "yesno", options: SIM_NAO },
    { section: "Opcionais", key: "tratamento_agua", label: "Tratamento de água", type: "yesno", options: SIM_NAO },
    { section: "Opcionais", key: "coletor", label: "Coletor / distribuidor", type: "yesno", options: SIM_NAO },
    { section: "Outros", key: "observacoes", label: "Observações técnicas", type: "multiline" },
    ...ELETRICA_COMUM,
  ],
  Termoacumulador: [
    { section: "Geral", key: "desenho", label: "N.º desenho", type: "text" },
    { section: "Geral", key: "tipo", label: "Tipo", type: "combo", options: ["Vertical", "Horizontal", "Outro"] },
    { section: "Geral", key: "capacidade", label: "Capacidade (L)", type: "text" },
    { section: "Geral", key: "pressao_projeto", label: "Pressão de projeto (bar)", type: "text" },
    { section: "Geral", key: "temperatura", label: "Temperatura de projeto (°C)", type: "text" },
    { section: "Construção", key: "material", label: "Material", type: "combo", options: MATERIAIS },
    { section: "Construção", key: "diametro", label: "Diâmetro (mm)", type: "text" },
    { section: "Construção", key: "altura", label: "Comprimento / altura (mm)", type: "text" },
    { section: "Construção", key: "isolamento", label: "Isolamento", type: "yesno", options: SIM_NAO },
    { section: "Construção", key: "revestimento", label: "Revestimento exterior", type: "combo", options: ["Alumínio", "Inox", "Outro", "Não"] },
    { section: "Permutadores", key: "permutadores_qtd", label: "Número de permutadores", type: "combo", options: ["0", "1", "2", "3", "4"] },
    { section: "Permutadores", key: "area", label: "Área total de permuta (m²)", type: "text" },
    { section: "Permutadores", key: "potencia", label: "Potência térmica total (kW)", type: "text" },
    { section: "Válvula de controlo", key: "valvula_tipo", label: "Tipo", type: "combo", options: ["2 vias", "3 vias", "Outro"] },
    { section: "Válvula de controlo", key: "valvula_dn", label: "DN", type: "text" },
    { section: "Válvula de controlo", key: "valvula_sinal", label: "Sinal de controlo", type: "combo", options: ["0-10 V", "4-20 mA", "3 pontos", "On/Off", "Outro"] },
    { section: "Outros", key: "observacoes", label: "Observações técnicas", type: "multiline" },
    { section: "Quadro elétrico", key: "el_config", label: "Configuração do quadro", type: "combo", options: ["Individual", "Comum a vários termoacumuladores"], electrical: true },
    ...ELETRICA_COMUM,
  ],
  Permutador: [
    { section: "Geral", key: "tipo", label: "Tipo", type: "combo", options: ["Tubular", "Placas", "Serpentina", "Outro"] },
    { section: "Geral", key: "potencia", label: "Potência térmica (kW)", type: "text" },
    { section: "Processo", key: "fluido_primario", label: "Fluido primário", type: "text" },
    { section: "Processo", key: "fluido_secundario", label: "Fluido secundário", type: "text" },
    { section: "Processo", key: "pressao_primario", label: "Pressão lado primário (bar)", type: "text" },
    { section: "Processo", key: "pressao_secundario", label: "Pressão lado secundário (bar)", type: "text" },
    { section: "Construção", key: "material_casco", label: "Material do casco", type: "combo", options: MATERIAIS },
    { section: "Construção", key: "material_tubos", label: "Material dos tubos", type: "combo", options: [...MATERIAIS.slice(0, 3), "Cobre", "Outro"] },
    { section: "Construção", key: "flange_dn", label: "DN de construção / flange", type: "text" },
    { section: "Construção", key: "flange_pn", label: "PN da flange", type: "text" },
    { section: "Outros", key: "observacoes", label: "Observações técnicas", type: "multiline" },
  ],
  "Quadro elétrico": [
    { section: "Geral", key: "equipamento", label: "Equipamento comandado", type: "text" },
    { section: "Geral", key: "execucao", label: "Execução", type: "combo", options: ["Termovapor", "Externo", "Outro"] },
    { section: "Geral", key: "ip", label: "Índice de proteção", type: "combo", options: ["IP54", "IP55", "IP65", "Outro"] },
    ...ELETRICA_COMUM,
  ],
  "Depósito de condensados": [
    { section: "Geral", key: "servico", label: "Serviço", type: "combo", options: ["Atmosférico", "Pressurizado"] },
    { section: "Geral", key: "capacidade", label: "Capacidade (L)", type: "text" },
    { section: "Construção", key: "material", label: "Material", type: "combo", options: MATERIAIS },
    { section: "Construção", key: "isolamento", label: "Isolamento", type: "yesno", options: SIM_NAO },
    { section: "Outros", key: "observacoes", label: "Observações técnicas", type: "multiline" },
  ],
  Economizador: [
    { section: "Geral", key: "potencia", label: "Potência recuperada (kW)", type: "text" },
    { section: "Construção", key: "material", label: "Material", type: "combo", options: MATERIAIS },
    { section: "Outros", key: "observacoes", label: "Observações técnicas", type: "multiline" },
  ],
  Coletor: [
    { section: "Geral", key: "servico", label: "Serviço", type: "text" },
    { section: "Geral", key: "diametro", label: "Diâmetro do corpo (mm)", type: "text" },
    { section: "Geral", key: "saidas", label: "Saídas (quantidade / DN)", type: "text" },
    { section: "Construção", key: "material", label: "Material", type: "combo", options: MATERIAIS },
    { section: "Outros", key: "observacoes", label: "Observações técnicas", type: "multiline" },
  ],
  Chaminé: [
    { section: "Geral", key: "diametro", label: "Diâmetro (mm)", type: "text" },
    { section: "Geral", key: "altura", label: "Altura (m)", type: "text" },
    { section: "Construção", key: "material", label: "Material", type: "combo", options: MATERIAIS },
    { section: "Outros", key: "observacoes", label: "Observações técnicas", type: "multiline" },
  ],
  Intervenção: [
    { section: "Intervenção", key: "equipamento_existente", label: "Equipamento onde está instalado", type: "text" },
    { section: "Intervenção", key: "trabalho", label: "Trabalho adjudicado", type: "multiline" },
    { section: "Intervenção", key: "extensao", label: "Extensão da intervenção", type: "combo", options: ["Parcial", "Total", "A definir"] },
    { section: "Intervenção", key: "ensaios", label: "Ensaios previstos", type: "multiline" },
  ],
  Outro: [
    { section: "Geral", key: "descricao", label: "Descrição técnica", type: "multiline" },
  ],
};

export const TIPOS_EQUIPAMENTO = ["Caldeira", "Termoacumulador", "Permutador", "Quadro elétrico", "Depósito de condensados", "Economizador", "Coletor", "Chaminé", "Outro"];

export const REGISTO_TIPOS = [
  "Equipamento novo",
  "Componente novo",
  "Reparação / intervenção",
  "Alteração / modificação",
  "Assistência / manutenção",
] as const;

export function templateFor(tipo: string, registoTipo: string): FieldDef[] {
  if (registoTipo !== "Equipamento novo" && registoTipo !== "Componente novo") return TEMPLATES["Intervenção"];
  return TEMPLATES[tipo] ?? TEMPLATES.Outro;
}
