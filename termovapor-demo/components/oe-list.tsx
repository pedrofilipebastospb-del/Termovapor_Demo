"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Plus } from "lucide-react";
import type { OEEstado } from "@/types";
import { date, daysUntil, matches } from "@/lib/format";
import { NovaOEModal } from "./forms";
import { OE_ESTADOS, PrioridadeBadge, StatusBadge } from "./status";
import { useStore } from "./store";
import { Button, Metric, PageHeader, SearchInput, Select, Table } from "./ui";

const VISTAS = { ativas: "Ativas", todas: "Todas", arquivo: "Arquivo" } as const;

export function OEList({ abrirNova = false }: { abrirNova?: boolean }) {
  const { state } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("");
  const [vista, setVista] = useState<keyof typeof VISTAS>("ativas");
  const [nova, setNova] = useState(abrirNova);

  const arquivo = (e: OEEstado) => ["Concluída", "Fechada", "Anulada"].includes(e);
  const rows = useMemo(
    () =>
      state.oes
        .filter((o) => (vista === "ativas" ? !arquivo(o.estado) : vista === "arquivo" ? arquivo(o.estado) : true))
        .filter((o) => !estado || o.estado === estado)
        .filter((o) => matches(query, o.numero, o.cliente, o.clienteCodigo, o.descricao, o.responsavel, o.encomendaCliente, ...state.nfs.filter((n) => n.oe === o.numero).map((n) => `NF ${n.numero} ${n.numero}`)))
        .sort((a, b) => b.numero - a.numero),
    [state.oes, state.nfs, vista, estado, query],
  );
  const ativas = state.oes.filter((o) => !arquivo(o.estado));

  return (
    <>
      <PageHeader
        eyebrow="Ordens de Execução"
        title="Ordens de Execução"
        description="Cada OE agrega os equipamentos e intervenções (NF), os pedidos elétricos ao OIF, a documentação final e o histórico de auditoria."
        actions={
          <Button onClick={() => setNova(true)}>
            <Plus size={15} /> Nova OE
          </Button>
        }
      />
      <div className="metrics four">
        <Metric label="OE ativas" value={ativas.length} icon={<ClipboardList size={16} />} />
        <Metric label="Em execução" value={state.oes.filter((o) => o.estado === "Em execução").length} accent="accent" />
        <Metric label="Aguarda material" value={state.oes.filter((o) => o.estado === "Aguarda material").length} accent="amber" />
        <Metric label="Entregas nos próximos 30 dias" value={ativas.filter((o) => daysUntil(o.dataEntrega) <= 30 && o.estado !== "Suspensa").length} hint="Excluindo OE suspensas" />
      </div>
      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar por OE, cliente, n.º SAGE, NF ou descrição…" />
        <div className="segmented" role="group" aria-label="Vista">
          {(Object.keys(VISTAS) as (keyof typeof VISTAS)[]).map((v) => (
            <button type="button" key={v} className={vista === v ? "active" : ""} onClick={() => setVista(v)}>
              {VISTAS[v]}
            </button>
          ))}
        </div>
        <Select label="Estado" value={estado} onChange={setEstado} options={OE_ESTADOS} placeholder="Todos os estados" />
        <span className="filter-total">{rows.length} OE</span>
      </div>
      <Table
        rows={rows}
        rowKey={(o) => String(o.numero)}
        onRow={(o) => router.push(`/oe/${o.numero}`)}
        empty="Nenhuma OE corresponde aos filtros."
        columns={[
          { label: "OE", render: (o) => <b>OE {o.numero}</b> },
          { label: "Data", render: (o) => date(o.dataCriacao) },
          { label: "N.º SAGE", render: (o) => <span className="mono">{o.clienteCodigo}</span> },
          { label: "Cliente", render: (o) => <b>{o.cliente}</b> },
          { label: "Descrição", render: (o) => <span className="muted" style={{ display: "inline-block", maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "bottom" }}>{o.descricao}</span> },
          { label: "NF", align: "center", render: (o) => state.nfs.filter((n) => n.oe === o.numero).length },
          { label: "Estado", render: (o) => <StatusBadge estado={o.estado} /> },
          { label: "Prioridade", render: (o) => <PrioridadeBadge prioridade={o.prioridade} /> },
          { label: "Responsável", render: (o) => o.responsavel },
          { label: "Entrega", align: "right", render: (o) => <span className={!arquivo(o.estado) && daysUntil(o.dataEntrega) < 10 ? "danger" : ""}>{date(o.dataEntrega)}</span> },
        ]}
      />
      {nova && <NovaOEModal onClose={() => setNova(false)} />}
    </>
  );
}
