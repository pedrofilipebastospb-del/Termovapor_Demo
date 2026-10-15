"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { matches } from "@/lib/format";
import { SincronizarSage } from "./sage-sync";
import { useStore } from "./store";
import { PageHeader, SearchInput, Table } from "./ui";

export function Clientes({ pesquisa = "" }: { pesquisa?: string }) {
  const { state } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState(pesquisa);
  const rows = state.clientes.filter((c) => matches(query, c.nome, c.codigo, c.localidade, c.nif));
  return (
    <>
      <PageHeader
        eyebrow="Catálogo Sage"
        title="Clientes"
        description="Listagem de clientes usada na criação de OE. A pesquisa aceita parte do nome, várias palavras em qualquer ordem, ignora acentos e aceita o n.º SAGE."
        actions={<SincronizarSage alvo="clientes" total={state.clientes.length} />}
      />
      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar por nome ou número SAGE" />
        <span className="filter-total">{rows.length} clientes</span>
      </div>
      <Table
        rows={rows}
        rowKey={(c) => c.codigo}
        pageSize={15}
        onRow={(c) => {
          const oe = state.oes.find((o) => o.clienteCodigo === c.codigo);
          router.push(oe ? `/oe/${oe.numero}` : "/oe?nova=1");
        }}
        columns={[
          { label: "N.º SAGE", render: (c) => <b className="mono">{c.codigo}</b> },
          { label: "Cliente", render: (c) => <b>{c.nome}</b> },
          { label: "Morada", render: (c) => <span className="muted">{c.morada}</span> },
          { label: "Localidade", render: (c) => c.localidade },
          { label: "NIF", render: (c) => c.nif },
          { label: "OE", align: "right", render: (c) => state.oes.filter((o) => o.clienteCodigo === c.codigo).map((o) => o.numero).join(", ") || "Não indicado" },
        ]}
      />
    </>
  );
}
