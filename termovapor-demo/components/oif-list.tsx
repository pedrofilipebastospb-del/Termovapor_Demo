"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PackageX, Zap } from "lucide-react";
import type { OIFEstado } from "@/types";
import { ETAPAS } from "@/data/eletrico";
import { cobertura, OIF_ATIVA, quadroDe } from "@/lib/engine";
import { date, daysUntil, matches, prazoLabel } from "@/lib/format";
import { OIF_ESTADOS, StatusBadge } from "./status";
import { useStore } from "./store";
import { Metric, PageHeader, Progress, SearchInput, Select, Table } from "./ui";

const COLUNAS: OIFEstado[] = ["Aberta", "Aguarda material", "Material reservado", "Em montagem", "Em teste"];

export function OIFList() {
  const { state, verComercial } = useStore();
  const router = useRouter();
  const [vista, setVista] = useState<"quadro" | "lista">("quadro");
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("");
  const rows = useMemo(
    () =>
      state.oifs
        .filter((o) => !estado || o.estado === estado)
        .filter((o) => matches(query, o.numero, o.pedido, `OE ${o.oe}`, `NF ${o.nf}`, o.responsavel, quadroDe(state, o)?.descricao, verComercial ? quadroDe(state, o)?.cliente : ""))
        .sort((a, b) => b.numero.localeCompare(a.numero)),
    [state, estado, query],
  );
  const ativas = state.oifs.filter(OIF_ATIVA);
  const comFaltas = ativas.filter((o) => cobertura(state, o).some((c) => c.falta > 0));

  return (
    <>
      <PageHeader
        eyebrow="OIF Elétrico"
        title="OIF / Produção"
        description="Ordens Internas de Fabrico dos quadros elétricos. Todas as OIF são criadas automaticamente a partir dos pedidos recebidos da OE."
        actions={
          <div className="segmented" role="group" aria-label="Vista">
            <button type="button" className={vista === "quadro" ? "active" : ""} onClick={() => setVista("quadro")}>
              Quadro de trabalho
            </button>
            <button type="button" className={vista === "lista" ? "active" : ""} onClick={() => setVista("lista")}>
              Lista
            </button>
          </div>
        }
      />
      <div className="metrics four">
        <Metric label="OIF em curso" value={ativas.length} accent="accent" icon={<Zap size={16} />} />
        <Metric label="Com falta real de material" value={comFaltas.length} accent={comFaltas.length ? "danger" : "positive"} icon={<PackageX size={16} />} />
        <Metric label="Prazo nos próximos 7 dias" value={ativas.filter((o) => daysUntil(o.prazo) <= 7).length} accent="amber" />
        <Metric label="Concluídas e devolvidas" value={state.oifs.filter((o) => o.estado === "Concluída").length} accent="positive" />
      </div>

      {vista === "quadro" ? (
        <div className="board">
          {COLUNAS.map((col) => {
            const items = ativas.filter((o) => o.estado === col);
            return (
              <div className="board-col" key={col}>
                <header>
                  <StatusBadge estado={col} />
                  <span className="muted">{items.length}</span>
                </header>
                {items.map((o) => {
                  const q = quadroDe(state, o);
                  const falta = cobertura(state, o).filter((c) => c.falta > 0).length;
                  return (
                    <Link className="board-card" key={o.numero} href={`/oif/${o.numero}`}>
                      <b>{o.numero}</b>
                      <small>{q?.descricao}</small>
                      <small>
                        OE {o.oe} · NF {o.nf}{verComercial ? ` · ${q?.cliente}` : ""}
                      </small>
                      <div style={{ marginTop: 10 }}>
                        {!o.importada && <Progress value={o.etapas.length / ETAPAS.length} />}
                      </div>
                      <div className="meta">
                        <span className={daysUntil(o.prazo) < 3 ? "danger" : "muted"} style={{ fontSize: 10.5 }}>
                          {prazoLabel(o.prazo)}
                        </span>
                        {falta > 0 ? <span className="badge red">{falta} em falta</span> : <span className="muted" style={{ fontSize: 10.5 }}>{o.responsavel || "Sem responsável"}</span>}
                      </div>
                    </Link>
                  );
                })}
                {!items.length && (
                  <p className="muted" style={{ fontSize: 11, padding: "6px 4px" }}>
                    Sem OIF neste estado.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="filter-bar">
            <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar por OIF, pedido, OE, NF ou responsável…" />
            <Select label="Estado" value={estado} onChange={setEstado} options={OIF_ESTADOS} placeholder="Todos os estados" />
            <span className="filter-total">{rows.length} OIF</span>
          </div>
          <Table
            rows={rows}
            rowKey={(o) => o.numero}
            onRow={(o) => router.push(`/oif/${o.numero}`)}
            columns={[
              { label: "OIF", render: (o) => <b>{o.numero}</b> },
              { label: "Quadro", render: (o) => <span><b>{quadroDe(state, o)?.codigo}</b><small className="block">{quadroDe(state, o)?.descricao}</small></span> },
              { label: "OE / NF", render: (o) => `OE ${o.oe} · NF ${o.nf}` },
              { label: "Estado", render: (o) => <StatusBadge estado={o.estado} /> },
              { label: "Etapa", render: (o) => <div className="cell-progress">{!o.importada && <Progress value={o.etapas.length / ETAPAS.length} />}{o.importada ? "Ver histórico" : `${o.etapas.length}/7`}</div> },
              { label: "Responsável", render: (o) => o.responsavel || <span className="muted">Não indicado</span> },
              { label: "Criada", render: (o) => date(o.criadaEm) },
              { label: "Prazo", align: "right", render: (o) => <span className={OIF_ATIVA(o) && daysUntil(o.prazo) < 3 ? "danger" : ""}>{date(o.prazo)}</span> },
            ]}
          />
        </>
      )}
    </>
  );
}
