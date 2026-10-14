// Perfis, áreas de trabalho e regras de acesso.
// Cada perfil vê apenas as áreas que lhe competem: a Engenharia (OE) não vê
// stock, compras nem custos; a Eletricidade (OIF) não vê dados comerciais da OE.
import type { Perfil } from "@/types";

export const ADMIN: Perfil = "Administração";
export const ENG: Perfil = "Engenharia / OE";
export const ELE: Perfil = "Eletricidade / OIF";
export const TODOS: Perfil[] = [ADMIN, ENG, ELE];

export type Conta = { utilizador: string; senha: string; perfil: Perfil; nome: string; funcao: string };

// Contas locais de acesso (sem servidor). Na versão final passam a ser
// utilizadores individuais autenticados no servidor.
export const CONTAS: Conta[] = [
  { utilizador: "admin", senha: "termovapor-admin", perfil: ADMIN, nome: "Nuno Barros", funcao: "Direção técnica" },
  { utilizador: "oe", senha: "termovapor-oe", perfil: ENG, nome: "Marta Lopes", funcao: "Engenharia / preparação" },
  { utilizador: "oif", senha: "termovapor-oif", perfil: ELE, nome: "Rui Ferreira", funcao: "Eletricidade / automação" },
];

export const contaDe = (perfil: Perfil) => CONTAS.find((c) => c.perfil === perfil)!;

export type Seccao = { label: string; href: string; perfis: Perfil[] };
export type Area = { key: string; label: string; href: string; perfis: Perfil[]; seccoes: Seccao[]; prefixos: string[] };

export const AREAS: Area[] = [
  { key: "geral", label: "Visão geral", href: "/", perfis: TODOS, seccoes: [], prefixos: [] },
  {
    key: "oe",
    label: "Ordens de execução",
    href: "/oe",
    perfis: [ADMIN, ENG],
    prefixos: ["/oe", "/equipamentos", "/documentacao"],
    seccoes: [
      { label: "Ordens", href: "/oe", perfis: [ADMIN, ENG] },
      { label: "Equipamentos / NF", href: "/equipamentos", perfis: [ADMIN, ENG] },
      { label: "Documentação", href: "/documentacao", perfis: [ADMIN, ENG] },
    ],
  },
  {
    key: "eletricidade",
    label: "Eletricidade e fabrico",
    href: "/pedidos",
    perfis: TODOS,
    prefixos: ["/pedidos", "/oif", "/quadros", "/origem"],
    seccoes: [
      { label: "Pedidos elétricos", href: "/pedidos", perfis: TODOS },
      { label: "Fabrico / OIF", href: "/oif", perfis: [ADMIN, ELE] },
      { label: "Quadros", href: "/quadros", perfis: [ADMIN, ELE] },
    ],
  },
  {
    key: "materiais",
    label: "Materiais e compras",
    href: "/artigos",
    perfis: [ADMIN, ELE],
    prefixos: ["/artigos", "/encomendas", "/rececoes", "/fornecedores", "/movimentos"],
    seccoes: [
      { label: "Artigos e stock", href: "/artigos", perfis: [ADMIN, ELE] },
      { label: "Compras", href: "/encomendas", perfis: [ADMIN, ELE] },
      { label: "Receções", href: "/rececoes", perfis: [ADMIN, ELE] },
      { label: "Fornecedores", href: "/fornecedores", perfis: [ADMIN, ELE] },
      { label: "Movimentos", href: "/movimentos", perfis: [ADMIN, ELE] },
    ],
  },
  { key: "clientes", label: "Clientes", href: "/clientes", perfis: [ADMIN, ENG], seccoes: [], prefixos: ["/clientes"] },
];

// Páginas utilitárias (fora das cinco áreas)
export const UTILITARIOS: { label: string; href: string; perfis: Perfil[] }[] = [
  { label: "Pesquisar documentos", href: "/documentos", perfis: TODOS },
  { label: "Histórico", href: "/historico", perfis: TODOS },
  { label: "Configuração", href: "/configuracao", perfis: [ADMIN] },
];

const matchPrefix = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

export function areaDe(path: string): Area | undefined {
  if (path === "/") return AREAS[0];
  return AREAS.find((a) => a.prefixos.some((p) => matchPrefix(path, p)));
}

export function podeAceder(perfil: Perfil, path: string): boolean {
  if (path === "/" || path === "/entrar") return true;
  // A ficha de origem (OE/NF limitada à parte elétrica) existe para a Eletricidade.
  if (matchPrefix(path, "/origem")) return perfil !== ENG;
  const util = UTILITARIOS.find((u) => matchPrefix(path, u.href));
  if (util) return util.perfis.includes(perfil);
  const area = areaDe(path);
  if (!area) return true;
  const seccao = [...area.seccoes].sort((a, b) => b.href.length - a.href.length).find((s) => matchPrefix(path, s.href));
  return (seccao?.perfis ?? area.perfis).includes(perfil);
}

/** A Eletricidade não recebe dados comerciais (cliente, moradas, encomenda, orçamento). */
export const veComercial = (perfil: Perfil) => perfil !== ELE;
/** Custos internos só para Administração e Eletricidade. */
export const veCustos = (perfil: Perfil) => perfil !== ENG;
/** Ligação para uma OE respeitando o perfil (a Eletricidade abre a ficha de origem). */
export const oeHref = (perfil: Perfil, numero: number) => (perfil === ELE ? `/origem/oe/${numero}` : `/oe/${numero}`);
