"use client";
import { useState } from "react";
import type { Auditoria } from "@/types";
import { ELE, ENG } from "@/lib/access";
import { dateTime, matches } from "@/lib/format";
import { useStore } from "./store";
import { Badge, PageHeader, SearchInput, Select, Table, type Tone } from "./ui";

const AMBITO_OE: Auditoria["entidade"][] = ["OE", "NF", "Pedido"];
const AMBITO_OIF: Auditoria["entidade"][] = ["Pedido", "OIF", "Quadro", "Artigo", "Encomenda"];
const TOM: Record<string, Tone> = { OE: "blue", NF: "blue", Pedido: "amber", OIF: "accent", Quadro: "accent", Artigo: "green", Encomenda: "green", Sistema: "neutral" };

// Histórico global de alterações, limitado ao âmbito do perfil.
export function Historico() {
  const { state, perfil } = useStore();
  const [query, setQuery] = useState("");
  const [entidade, setEntidade] = useState("");
  const ambito = perfil === ENG ? AMBITO_OE : perfil === ELE ? AMBITO_OIF : null;
  const base = state.auditoria.filter((a) => !ambito || ambito.includes(a.entidade));
  const entidades = [...new Set(base.map((a) => a.entidade))];
  const rows = base.filter((a) => (!entidade || a.entidade === entidade) && matches(query, a.referencia, a.acao, a.detalhe, a.utilizador));
  return (
    <>
      <PageHeader
        title="Histórico"
        description={perfil === ENG ? "Alterações nas ordens, equipamentos e pedidos elétricos." : perfil === ELE ? "Alterações nos pedidos recebidos, OIF, quadros, artigos e compras." : "Todas as alterações registadas, da OE ao OIF: quem fez, o quê e quando."}
      />
      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar referência, ação, detalhe ou utilizador…" />
        <Select label="Entidade" value={entidade} onChange={setEntidade} options={entidades} placeholder="Todas as entidades" />
        <span className="filter-total">{rows.length} registos</span>
      </div>
      <Table
        rows={rows}
        rowKey={(a) => a.id}
        pageSize={20}
        columns={[
          { label: "Data", render: (a) => dateTime(a.data) },
          { label: "Entidade", render: (a) => <Badge tone={TOM[a.entidade]}>{a.entidade}</Badge> },
          { label: "Referência", render: (a) => <b className="mono">{a.referencia}</b> },
          { label: "Ação", render: (a) => a.acao },
          { label: "Detalhe", render: (a) => <span className="muted wrap" style={{ display: "inline-block", maxWidth: 420 }}>{a.detalhe || "—"}</span> },
          { label: "Utilizador", render: (a) => a.utilizador },
        ]}
      />
    </>
  );
}
