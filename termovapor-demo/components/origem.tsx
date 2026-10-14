"use client";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { templateFor } from "@/data/templates";
import { StatusBadge } from "./status";
import { useStore } from "./store";
import { Note, PageHeader, Panel } from "./ui";

// Ficha de origem para a Eletricidade: só identificadores OE/NF e os campos
// elétricos dos equipamentos com pedidos recebidos. Sem dados comerciais
// nem definição mecânica.
export function OrigemOE({ numero }: { numero: number }) {
  const { state } = useStore();
  const oe = state.oes.find((o) => o.numero === numero);
  const pedidos = state.pedidos.filter((p) => p.oe === numero && p.estado !== "Não enviado");
  const nfsEnvolvidos = new Set(pedidos.flatMap((p) => [p.quadroNf, ...p.nfs]));
  const nfs = state.nfs.filter((n) => n.oe === numero && nfsEnvolvidos.has(n.numero));
  const documentos = state.documentos.filter((d) => d.oe === numero && d.categoria === "Elétrica / automação");

  if (!oe || !pedidos.length)
    return (
      <>
        <Link href="/pedidos" className="back-link">
          <ArrowLeft size={14} /> Pedidos elétricos
        </Link>
        <PageHeader title={`OE ${numero}`} description="Sem pedidos elétricos recebidos desta ordem." />
      </>
    );

  return (
    <>
      <Link href="/pedidos" className="back-link">
        <ArrowLeft size={14} /> Pedidos elétricos
      </Link>
      <PageHeader eyebrow="Origem do pedido · contexto elétrico" title={`OE ${oe.numero}`} description="Equipamentos e requisitos elétricos dos pedidos recebidos pelo OIF." />
      <Note tone="blue" icon={<Lock size={15} />}>
        Consulta limitada à parte elétrica. Cliente, moradas, encomenda, orçamento e definição mecânica ficam na engenharia.
      </Note>
      <div className="grid-two">
        <Panel title="Pedidos recebidos">
          <div className="activity-list">
            {pedidos.map((p) => (
              <Link key={p.codigo} href={`/pedidos?p=${p.codigo}`}>
                <span style={{ minWidth: 0 }}>
                  <b className="mono">{p.codigo}</b>
                  <small>
                    {p.titulo} · quadro NF {p.quadroNf}
                  </small>
                </span>
                <span className="attention-meta">{p.oif && <small>{p.oif}</small>}</span>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel title="Documentos elétricos" subtitle={`${documentos.length} documentos`}>
          <div className="panel-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
            {documentos.map((d) => (
              <div className="doc-row" key={d.id}>
                <span className="doc-icon">PDF</span>
                <span>
                  <b>{d.descricao}</b>
                  <small>{d.nome}</small>
                </span>
              </div>
            ))}
            {!documentos.length && <p className="muted" style={{ fontSize: 12, padding: "10px 0" }}>Ainda sem documentos elétricos.</p>}
          </div>
        </Panel>
      </div>
      {nfs.map((n) => {
        const campos = templateFor(n.tipo, n.registoTipo).filter((f) => f.electrical);
        return (
          <Panel key={n.numero} title={`NF ${n.numero} · ${n.tipo}`} subtitle={n.designacao} actions={<StatusBadge estado={n.estado} />}>
            <div className="panel-body">
              {campos.length ? (
                <dl className="kv-grid">
                  {campos.map((f) => (
                    <div key={f.key}>
                      <dt>{f.label}</dt>
                      <dd className={n.campos[f.key] ? "" : "empty-value"}>{n.campos[f.key] || "Por definir"}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="muted" style={{ fontSize: 12 }}>Equipamento comandado pelo quadro; sem campos elétricos próprios.</p>
              )}
            </div>
          </Panel>
        );
      })}
    </>
  );
}
