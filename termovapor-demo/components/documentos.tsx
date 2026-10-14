"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import type { DocCategoria } from "@/types";
import { ELE, oeHref } from "@/lib/access";
import { date, matches, sum } from "@/lib/format";
import { useStore } from "./store";
import { Badge, Metric, PageHeader, SearchInput, Select, Table } from "./ui";

export const CATEGORIAS: { categoria: DocCategoria; pasta: string }[] = [
  { categoria: "Geral OE", pasta: "00_Documentos_OE" },
  { categoria: "Desenhos", pasta: "02_Desenhos" },
  { categoria: "Cálculos", pasta: "03_Calculos" },
  { categoria: "Certificados", pasta: "04_Certificados" },
  { categoria: "Manuais / fichas técnicas", pasta: "05_Manuais_Fichas_Tecnicas" },
  { categoria: "Elétrica / automação", pasta: "06_Eletrica_Automacao" },
  { categoria: "Inspeções / ensaios", pasta: "08_Inspecoes_Ensaios" },
  { categoria: "Documentação cliente", pasta: "09_Documentacao_Cliente" },
];

// Dossier de cada OE: quantas categorias têm documentos e o que já veio do OIF.
export function Documentacao() {
  const { state } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const rows = state.oes
    .filter((o) => matches(query, `OE ${o.numero}`, o.cliente, o.descricao))
    .map((o) => {
      const docs = state.documentos.filter((d) => d.oe === o.numero);
      return { oe: o, docs, cats: new Set(docs.map((d) => d.categoria)).size, eletricos: docs.filter((d) => d.categoria === "Elétrica / automação").length, paginas: sum(docs, (d) => d.paginas) };
    })
    .sort((a, b) => b.oe.numero - a.oe.numero);
  return (
    <>
      <PageHeader eyebrow="Ordens de execução" title="Documentação" description="Dossier de cada ordem por categoria. Uma categoria preenchida não certifica que o dossier esteja completo." />
      <div className="metrics four">
        <Metric label="Documentos arquivados" value={state.documentos.length} icon={<FileText size={16} />} />
        <Metric label="Ordens com documentos" value={rows.filter((r) => r.docs.length).length} />
        <Metric label="Devolvidos pelo OIF" value={state.documentos.filter((d) => d.categoria === "Elétrica / automação").length} accent="accent" />
        <Metric label="Páginas no total" value={sum(state.documentos, (d) => d.paginas)} />
      </div>
      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar OE, cliente ou descrição…" />
        <span className="filter-total">{rows.length} ordens</span>
      </div>
      <Table
        rows={rows}
        rowKey={(r) => String(r.oe.numero)}
        onRow={(r) => router.push(`/oe/${r.oe.numero}?tab=dossier`)}
        columns={[
          { label: "OE", render: (r) => <b>OE {r.oe.numero}</b> },
          { label: "Cliente / trabalho", render: (r) => <span><b>{r.oe.cliente}</b><small className="block">{r.oe.descricao}</small></span> },
          { label: "Documentos", align: "right", render: (r) => r.docs.length || <span className="muted">0</span> },
          {
            label: "Categorias",
            render: (r) => (
              <span className="dossier-dots" title={CATEGORIAS.map((c) => `${c.pasta}: ${r.docs.filter((d) => d.categoria === c.categoria).length}`).join("\n")}>
                {CATEGORIAS.map((c) => (
                  <i key={c.pasta} className={r.docs.some((d) => d.categoria === c.categoria) ? "on" : ""} />
                ))}
                <small>
                  {r.cats}/{CATEGORIAS.length}
                </small>
              </span>
            ),
          },
          { label: "Elétrica (OIF)", align: "right", render: (r) => (r.eletricos ? <Badge tone="blue">{r.eletricos}</Badge> : <span className="muted">—</span>) },
          { label: "Páginas", align: "right", render: (r) => r.paginas || "—" },
        ]}
      />
    </>
  );
}

// Pesquisa documental global, limitada ao âmbito do perfil.
export function PesquisaDocumentos() {
  const { state, perfil } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState("");
  // A Eletricidade só vê os documentos elétricos.
  const base = state.documentos.filter((d) => perfil !== ELE || d.categoria === "Elétrica / automação");
  const rows = base.filter((d) => (!categoria || d.categoria === categoria) && matches(query, d.nome, d.descricao, `OE ${d.oe}`, d.nf ? `NF ${d.nf}` : ""));
  return (
    <>
      <PageHeader title="Pesquisar documentos" description={perfil === ELE ? "Documentos elétricos das ordens com pedidos recebidos pelo OIF." : "Todos os documentos arquivados nas ordens de execução e nos equipamentos."} />
      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Nome do ficheiro, descrição, OE ou NF…" />
        {perfil !== ELE && <Select label="Categoria" value={categoria} onChange={setCategoria} options={CATEGORIAS.map((c) => c.categoria)} placeholder="Todas as categorias" />}
        <span className="filter-total">{rows.length} documentos</span>
      </div>
      <Table
        rows={rows}
        rowKey={(d) => d.id}
        pageSize={15}
        onRow={(d) => router.push(perfil === ELE ? oeHref(perfil, d.oe) : `/oe/${d.oe}?tab=dossier`)}
        columns={[
          { label: "Documento", render: (d) => <span className="cell-main"><span className="doc-icon small">PDF</span><span><b>{d.descricao}</b><small className="block">{d.nome}</small></span></span> },
          { label: "OE", render: (d) => `OE ${d.oe}` },
          { label: "NF", render: (d) => (d.nf ? `NF ${d.nf}` : <span className="muted">Geral</span>) },
          { label: "Categoria", render: (d) => <Badge>{d.categoria}</Badge> },
          { label: "Páginas", align: "right", render: (d) => d.paginas },
          { label: "Data", align: "right", render: (d) => date(d.data) },
        ]}
      />
    </>
  );
}
