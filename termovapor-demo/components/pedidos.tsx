"use client";
import { PdfLink } from "./pdf-link";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, FileJson, Send } from "lucide-react";
import type { OIF, PedidoEletrico, State } from "@/types";
import { enviarPedido } from "@/lib/actions";
import { ELE, ENG, oeHref } from "@/lib/access";
import { date, matches } from "@/lib/format";
import { FlowStepper, StatusBadge } from "./status";
import { useStore } from "./store";
import { DetailList, Metric, Modal, Note, PageHeader, SearchInput, Select, Table, Button } from "./ui";

// Dois lados do mesmo pedido: o estado na OE (envio) e o estado no OIF (resposta).
export function estadoOE(p: PedidoEletrico) {
  if (p.estado === "Não enviado") return "Não enviada";
  if (p.estado === "Devolvido à OE") return "Recebida do OIF";
  return "Enviada ao OIF";
}
export function estadoOIF(p: PedidoEletrico, oif?: OIF) {
  if (p.estado === "Não enviado") return "Não indicado";
  if (p.estado === "Devolvido à OE" || oif?.estado === "Concluída") return "Devolvida à OE";
  if (p.estadoOIFOrigem) return p.estadoOIFOrigem;
  if (!oif || oif.etapas.length <= 2) return "Recebida";
  return "Em elaboração";
}
export const oifDe = (state: State, p: PedidoEletrico) => state.oifs.find((o) => o.numero === p.oif);

function PedidoDrawer({ pedido, onClose }: { pedido: PedidoEletrico; onClose: () => void }) {
  const { state, apply, user, perfil, verComercial } = useStore();
  const oe = state.oes.find((o) => o.numero === pedido.oe);
  const oif = oifDe(state, pedido);
  const payload = {
    pedido: pedido.codigo,
    revisao: pedido.revisao,
    nf_quadro: pedido.quadroNf,
    nf_equipamentos: pedido.nfs,
    eletrica_automacao: { hmi: pedido.hmi, alimentacao: pedido.alimentacao, motores: pedido.motores, sondas: pedido.sondas, requisitos: pedido.requisitos },
  };
  return (
    <Modal drawer wide title={pedido.codigo} subtitle={pedido.titulo} onClose={onClose}>
      <div className="modal-body">
        <div className="compare-states">
          <div>
            <small>Estado na OE</small>
            <StatusBadge estado={estadoOE(pedido)} />
            <span className="muted">
              <Link className="accent" href={oeHref(perfil, pedido.oe)}>
                OE {pedido.oe}
              </Link>
              {verComercial && oe ? ` · ${oe.cliente}` : ""}
            </span>
          </div>
          <div>
            <small>Estado no OIF</small>
            <StatusBadge estado={estadoOIF(pedido, oif)} />
            <span className="muted">{oif ? `${oif.numero} · ${oif.estado}` : "Sem OIF associada"}</span>
          </div>
        </div>
        {oif && (
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-body">
              <FlowStepper oif={oif} compact />
            </div>
          </div>
        )}
        <DetailList
          items={[
            ["NF do quadro", `NF ${pedido.quadroNf}`],
            ["Equipamentos abrangidos", pedido.nfs.map((n) => `NF ${n}`).join(", ") || "Não indicado"],
            ["Configuração", pedido.nfs.length > 1 ? "Quadro comum" : "Quadro individual"],
            ["Interface", pedido.hmi],
            ["Alimentação", pedido.alimentacao],
            ["Motores", pedido.motores],
            ["Sondas", pedido.sondas],
            ["Requisitos funcionais", pedido.requisitos],
            ["Revisão", `R${String(pedido.revisao).padStart(2, "0")}`],
            ["Enviado em", date(pedido.dataEnvio)],
            ["Devolvido em", date(pedido.dataDevolucao)],
            ["Definição final do OIF", pedido.definicaoFinal],
          ]}
        />
        {state.documentos.some((d) => d.pedidoCodigo === pedido.codigo) && <section aria-label="Documentos do pedido" style={{ marginTop: 20 }}><h3 style={{ fontSize: 12 }}>Documentos do pedido</h3>{state.documentos.filter((d) => d.pedidoCodigo === pedido.codigo).map((d) => <div className="doc-row" key={d.id}><span><b>{d.descricao}</b><small>{d.nome}</small></span><PdfLink href={d.pdfUrl} /></div>)}</section>}
        <h3 style={{ margin: "20px 0 8px", fontSize: 12 }} className="title-row">
          <FileJson size={15} /> Conteúdo enviado ao OIF
        </h3>
        <pre className="mono json-box">{JSON.stringify(payload, null, 2)}</pre>
        <Note tone="blue">Só seguem o NF e a informação elétrica. Cliente, moradas, descrição comercial e dados mecânicos ficam na OE.</Note>
        <div className="form-actions">
          {pedido.oif && perfil !== ENG && (
            <Link className="button" href={`/oif/${pedido.oif}`}>
              Abrir {pedido.oif} <ArrowRight size={14} />
            </Link>
          )}
          {!pedido.oif && perfil !== ELE && (
            <Button onClick={() => apply((s) => enviarPedido(s, pedido.codigo, user)[0], `Pedido ${pedido.codigo} enviado. OIF criada automaticamente.`)}>
              <Send size={14} /> Enviar ao OIF
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

const FILAS = { todos: "Todos", oe: "OE · Preparação", oif: "OIF · Em elaboração", devolvidos: "Resposta · Devolvida" } as const;

export function Pedidos({ abrir }: { abrir?: string }) {
  const { state, perfil, verComercial } = useStore();
  const [fila, setFila] = useState<keyof typeof FILAS>("todos");
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("");
  const [aberto, setAberto] = useState<string | null>(abrir ?? null);
  // A Eletricidade só vê pedidos já recebidos (sem rascunhos da OE).
  const visiveis = state.pedidos.filter((p) => perfil !== ELE || p.estado !== "Não enviado");
  const filaDe = (p: PedidoEletrico) => (p.estado === "Não enviado" ? "oe" : p.estado === "Devolvido à OE" ? "devolvidos" : "oif");
  const rows = visiveis
    .filter((p) => fila === "todos" || filaDe(p) === fila)
    .filter((p) => !estado || estadoOE(p) === estado)
    .filter((p) => matches(query, p.codigo, p.titulo, `OE ${p.oe}`, `NF ${p.quadroNf}`, p.oif, ...p.nfs.map((n) => `NF ${n}`)));
  const pedido = state.pedidos.find((p) => p.codigo === aberto);
  const conta = (f: string) => visiveis.filter((p) => filaDe(p) === f).length;

  return (
    <>
      <PageHeader
        eyebrow={perfil === ELE ? "OIF · Pedidos recebidos" : "Eletricidade e automação"}
        title="Pedidos elétricos"
        description="Requisitos elétricos dos equipamentos e respostas do OIF. Cada pedido tem um quadro e uma OIF, criada automaticamente quando a OE o envia."
      />
      <div className="metrics process">
        {perfil !== ELE && (
          <Metric label="OE · Preparação" value={conta("oe")} hint="Por enviar ao OIF" accent="amber" onClick={() => setFila(fila === "oe" ? "todos" : "oe")} />
        )}
        <Metric label="OIF · Em elaboração" value={conta("oif")} hint="Recebidos, por devolver" accent="accent" onClick={() => setFila(fila === "oif" ? "todos" : "oif")} />
        <Metric label="Resposta · Devolvida" value={conta("devolvidos")} hint="Definição final devolvida à OE" accent="positive" onClick={() => setFila(fila === "devolvidos" ? "todos" : "devolvidos")} />
      </div>
      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar pedido, OE, NF ou OIF…" />
        <div className="segmented" role="group" aria-label="Fila">
          {(Object.keys(FILAS) as (keyof typeof FILAS)[])
            .filter((f) => perfil !== ELE || f !== "oe")
            .map((f) => (
              <button type="button" key={f} className={fila === f ? "active" : ""} onClick={() => setFila(f)}>
                {FILAS[f]}
              </button>
            ))}
        </div>
        <Select label="Estado na OE" value={estado} onChange={setEstado} options={["Não enviada", "Enviada ao OIF", "Recebida do OIF"]} placeholder="Todos os estados" />
        <span className="filter-total">{rows.length} pedidos</span>
      </div>
      <Table
        rows={rows}
        rowKey={(p) => p.codigo}
        onRow={(p) => setAberto(p.codigo)}
        columns={[
          { label: "Pedido", render: (p) => <span><b>{p.codigo}</b><small className="block">{p.titulo}</small></span> },
          {
            label: "OE / equipamentos",
            render: (p) => (
              <span>
                <b>OE {p.oe}</b>
                <small className="block">
                  {p.nfs.map((n) => `NF ${n}`).join(" · ")}
                  {verComercial ? ` · ${state.oes.find((o) => o.numero === p.oe)?.cliente ?? ""}` : ""}
                </small>
              </span>
            ),
          },
          { label: "NF do quadro", render: (p) => <span className="mono">{p.quadroNf}</span> },
          { label: "Rev.", align: "center", render: (p) => `R${String(p.revisao).padStart(2, "0")}` },
          { label: "Estado na OE", render: (p) => <StatusBadge estado={estadoOE(p)} /> },
          { label: "Estado no OIF", render: (p) => (estadoOIF(p, oifDe(state, p)) === "Não indicado" ? <span className="muted">Não indicado</span> : <StatusBadge estado={estadoOIF(p, oifDe(state, p))} />) },
          { label: "OIF / fase", render: (p) => { const o = oifDe(state, p); return o ? <span><b>{o.numero}</b><small className="block">{o.estado}</small></span> : <span className="muted">Sem OIF</span>; } },
        ]}
      />
      {pedido && <PedidoDrawer pedido={pedido} onClose={() => setAberto(null)} />}
    </>
  );
}
