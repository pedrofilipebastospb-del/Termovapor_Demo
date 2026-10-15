"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CornerDownRight, Factory, Hash } from "lucide-react";
import { TIPOS_EQUIPAMENTO } from "@/data/templates";
import { nextNF } from "@/lib/engine";
import { matches } from "@/lib/format";
import { NFEditor } from "./nf-editor";
import { NF_ESTADOS, StatusBadge } from "./status";
import { useStore } from "./store";
import { Metric, PageHeader, SearchInput, Select, Table } from "./ui";

export function Equipamentos() {
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);
  const rows = useMemo(
    () =>
      state.nfs
        .filter((n) => (!tipo || n.tipo === tipo) && (!estado || n.estado === estado))
        .filter((n) => {
          const oe = state.oes.find((o) => o.numero === n.oe);
          return matches(query, `NF ${n.numero}`, n.numero, n.designacao, n.tipo, `OE ${n.oe}`, oe?.cliente);
        })
        .sort((a, b) => b.numero.localeCompare(a.numero, "pt", { numeric: true })),
    [state.nfs, state.oes, tipo, estado, query],
  );
  const principais = state.nfs.filter((n) => !n.principal);
  return (
    <>
      <PageHeader
        eyebrow="Ordens de Execução"
        title="Equipamentos / Números de Fabrico"
        description="Registo global de NF. A sequência é única para toda a empresa e um NF principal utilizado nunca volta a ser atribuído."
      />
      <div className="metrics four">
        <Metric label="NF registados" value={state.nfs.length} hint={`${principais.length} principais · ${state.nfs.length - principais.length} sub-NF`} icon={<Factory size={16} />} />
        <Metric label="Em fabrico" value={state.nfs.filter((n) => n.estado === "Em fabrico").length} accent="accent" />
        <Metric label="Em definição técnica" value={state.nfs.filter((n) => n.estado === "Definição").length} accent="amber" />
        <Metric label="Próximo NF disponível" value={`NF ${nextNF(state)}`} hint={`${state.nfReservados.length} números já reservados`} icon={<Hash size={16} />} />
      </div>
      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar por NF, OE, cliente ou designação…" />
        <Select label="Tipo" value={tipo} onChange={setTipo} options={TIPOS_EQUIPAMENTO} placeholder="Todos os tipos" />
        <Select label="Estado" value={estado} onChange={setEstado} options={NF_ESTADOS} placeholder="Todos os estados" />
        <span className="filter-total">{rows.length} NF</span>
      </div>
      <Table
        rows={rows}
        rowKey={(n) => n.numero}
        pageSize={14}
        onRow={(n) => setAberto(n.numero)}
        columns={[
          { label: "NF", render: (n) => <span className="cell-main">{n.principal && <CornerDownRight size={14} className="muted" />}<b>NF {n.numero}</b></span> },
          { label: "OE", render: (n) => <Link className="accent" href={`/oe/${n.oe}`} onClick={(e) => e.stopPropagation()}>OE {n.oe}</Link> },
          { label: "Cliente", render: (n) => state.oes.find((o) => o.numero === n.oe)?.cliente ?? "Não indicado" },
          { label: "Tipo", render: (n) => n.tipo },
          { label: "Designação", render: (n) => <b>{n.designacao}</b> },
          { label: "Registo", render: (n) => <span className="muted">{n.registoTipo}</span> },
          { label: "Estado", render: (n) => <StatusBadge estado={n.estado} /> },
        ]}
      />
      {aberto && <NFEditor numero={aberto} onClose={() => setAberto(null)} />}
    </>
  );
}
