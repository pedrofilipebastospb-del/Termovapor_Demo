"use client";
import { useState } from "react";
import Link from "next/link";
import { PackageCheck, Send, Truck } from "lucide-react";
import type { Encomenda } from "@/types";
import { avancarEncomenda, receberEncomenda } from "@/lib/actions";
import { date, daysUntil, matches, money, num, sum } from "@/lib/format";
import { StatusBadge } from "./status";
import { useStore } from "./store";
import { Badge, Button, DetailList, Field, Metric, Modal, Note, PageHeader, SearchInput, Table } from "./ui";

const total = (e: Encomenda) => sum(e.linhas, (l) => l.quantidade * l.preco);
const pendente = (e: Encomenda) => e.linhas.filter((l) => l.recebido < l.quantidade).length;

function EncomendaDrawer({ enc, onClose }: { enc: Encomenda; onClose: () => void }) {
  const { state, apply, user, verCustos, notify } = useStore();
  const forn = state.fornecedores.find((f) => f.codigo === enc.fornecedor);
  const [guia, setGuia] = useState("");
  const [qtd, setQtd] = useState<Record<string, number>>(() => Object.fromEntries(enc.linhas.map((l) => [l.artigoId, l.quantidade - l.recebido])));
  const proximo = enc.estado === "Rascunho" ? "Marcar como enviada" : enc.estado === "Enviada" ? "Confirmar pelo fornecedor" : null;
  const podeReceber = ["Enviada", "Confirmada", "Recebida parcial"].includes(enc.estado);
  const rececoes = state.rececoes.filter((r) => r.encomenda === enc.numero);
  return (
    <Modal drawer wide title={enc.numero} subtitle={forn?.nome} onClose={onClose}>
      <div className="modal-body">
        <div className="title-row" style={{ marginBottom: 12 }}>
          <StatusBadge estado={enc.estado} />
        </div>
        <DetailList
          items={[
            ["Fornecedor", forn?.nome],
            ["Contacto", `${forn?.email} · ${forn?.telefone}`],
            ["Data", date(enc.data)],
            ["Entrega prevista", date(enc.previsao)],
            ["OIF associada", enc.oif ? <Link key="o" className="accent" href={`/oif/${enc.oif}`}>{enc.oif}</Link> : "Reposição de stock"],
            ...(verCustos ? ([["Total", money(total(enc))]] as [string, string][]) : []),
          ]}
        />
        <h3 style={{ margin: "18px 0 8px", fontSize: 12 }}>Linhas da encomenda</h3>
        <Table
          rows={enc.linhas}
          rowKey={(l) => l.artigoId}
          columns={[
            { label: "Artigo", render: (l) => { const a = state.artigos.find((x) => x.id === l.artigoId); return <span><b>{a?.codigo}</b><small className="block">{a?.descricao}</small></span>; } },
            { label: "Encomendado", align: "right", render: (l) => num(l.quantidade, 2) },
            { label: "Recebido", align: "right", render: (l) => <span className={l.recebido >= l.quantidade ? "positive" : ""}>{num(l.recebido, 2)}</span> },
            { label: "Pendente", align: "right", render: (l) => (l.quantidade - l.recebido > 0 ? <Badge tone="amber">{num(l.quantidade - l.recebido, 2)}</Badge> : "Não indicado") },
            ...(podeReceber
              ? [
                  {
                    label: "A receber",
                    align: "right" as const,
                    render: (l: Encomenda["linhas"][number]) =>
                      l.recebido < l.quantidade ? (
                        <input
                          type="number"
                          min={0}
                          max={l.quantidade - l.recebido}
                          aria-label="Quantidade a receber"
                          value={qtd[l.artigoId] ?? 0}
                          style={{ width: 76, minHeight: 30, padding: "4px 8px" }}
                          onChange={(e) => setQtd((q) => ({ ...q, [l.artigoId]: Math.max(0, Math.min(Number(e.target.value) || 0, l.quantidade - l.recebido)) }))}
                        />
                      ) : (
                        "Não indicado"
                      ),
                  },
                ]
              : []),
            ...(verCustos ? [{ label: "Preço", align: "right" as const, render: (l: Encomenda["linhas"][number]) => money(l.preco) }] : []),
          ]}
        />
        {podeReceber && (
          <div className="form-grid" style={{ marginTop: 16 }}>
            <Field label="Guia do fornecedor" hint="Opcional · fica registada na receção">
              <input value={guia} onChange={(e) => setGuia(e.target.value)} placeholder="Ex.: GT 2026/1234" />
            </Field>
          </div>
        )}
        {rececoes.length > 0 && (
          <>
            <h3 style={{ margin: "10px 0 8px", fontSize: 12 }}>Receções registadas</h3>
            {rececoes.map((r) => (
              <div className="doc-row" key={r.numero}>
                <span>
                  <b>{r.numero}</b>
                  <small>
                    {date(r.data)} · {r.guia || "sem guia"} · {r.linhas.length} {r.linhas.length === 1 ? "artigo" : "artigos"}
                  </small>
                </span>
              </div>
            ))}
          </>
        )}
        {enc.oif && enc.estado !== "Recebida" && <Note tone="blue">Depois da receção, abra a {enc.oif} e reserve os materiais que entraram em stock.</Note>}
        <div className="form-actions">
          {proximo && (
            <Button secondary onClick={() => apply((s) => avancarEncomenda(s, enc.numero, user), `${enc.numero}: estado atualizado.`)}>
              <Send size={14} /> {proximo}
            </Button>
          )}
          {podeReceber && (
            <Button
              disabled={!Object.values(qtd).some((v) => v > 0)}
              onClick={() => {
                const [, rc] = receberEncomenda(state, enc.numero, qtd, guia, user);
                if (!rc) {
                  notify("Indique pelo menos uma quantidade a receber.");
                  return;
                }
                apply((s) => receberEncomenda(s, enc.numero, qtd, guia, user)[0], `${rc} registada. Stock atualizado.`);
                setGuia("");
              }}
            >
              <PackageCheck size={14} /> Registar receção
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function Encomendas() {
  const { state, verCustos } = useStore();
  const [aberta, setAberta] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const abertas = state.encomendas.filter((e) => !["Recebida", "Cancelada"].includes(e.estado));
  const enc = state.encomendas.find((e) => e.numero === aberta);
  const rows = state.encomendas.filter((e) => matches(query, e.numero, e.oif, state.fornecedores.find((f) => f.codigo === e.fornecedor)?.nome));
  return (
    <>
      <PageHeader eyebrow="OIF · Compras" title="Encomendas a fornecedores" description="Material encomendado, recebido e ainda por receber. A receção pode ser parcial e dá entrada automática em stock." />
      <div className="metrics four">
        <Metric label="Encomendas em aberto" value={abertas.length} icon={<Truck size={16} />} />
        <Metric label="Rascunhos por enviar" value={state.encomendas.filter((e) => e.estado === "Rascunho").length} accent="amber" />
        <Metric label="Entrega nos próximos 3 dias" value={abertas.filter((e) => e.estado !== "Rascunho" && daysUntil(e.previsao) <= 3).length} accent="accent" />
        <Metric label={verCustos ? "Valor em aberto" : "Ligadas a OIF"} value={verCustos ? money(sum(abertas, total)) : abertas.filter((e) => e.oif).length} />
      </div>
      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar encomenda, fornecedor ou OIF…" />
        <span className="filter-total">{rows.length} encomendas</span>
      </div>
      <Table
        rows={rows}
        rowKey={(e) => e.numero}
        onRow={(e) => setAberta(e.numero)}
        columns={[
          { label: "Encomenda", render: (e) => <b>{e.numero}</b> },
          { label: "Fornecedor", render: (e) => state.fornecedores.find((f) => f.codigo === e.fornecedor)?.nome },
          { label: "OIF", render: (e) => e.oif ?? <span className="muted">Stock</span> },
          { label: "Data", render: (e) => date(e.data) },
          { label: "Previsão", render: (e) => <span className={e.estado !== "Recebida" && daysUntil(e.previsao) < 0 ? "danger" : ""}>{date(e.previsao)}</span> },
          { label: "Linhas por receber", align: "right", render: (e) => pendente(e) },
          { label: "Estado", render: (e) => <StatusBadge estado={e.estado} /> },
          ...(verCustos ? [{ label: "Total", align: "right" as const, render: (e: Encomenda) => money(total(e)) }] : []),
        ]}
      />
      {enc && <EncomendaDrawer enc={enc} onClose={() => setAberta(null)} />}
    </>
  );
}

export function Fornecedores() {
  const { state, verCustos } = useStore();
  const [query, setQuery] = useState("");
  const rows = state.fornecedores.filter((f) => matches(query, f.nome, f.codigo, f.nif, f.email));
  return (
    <>
      <PageHeader eyebrow="OIF · Compras" title="Fornecedores" description="Contactos, prazos médios de entrega e histórico de encomendas por fornecedor." />
      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar fornecedor, NIF ou e-mail…" />
        <span className="filter-total">{rows.length} fornecedores</span>
      </div>
      <Table
        rows={rows}
        rowKey={(f) => f.codigo}
        columns={[
          { label: "Código", render: (f) => <b>{f.codigo}</b> },
          { label: "Fornecedor", render: (f) => <b>{f.nome}</b> },
          { label: "NIF", render: (f) => f.nif },
          { label: "Contacto", render: (f) => <span className="muted">{f.email} · {f.telefone}</span> },
          { label: "Prazo médio", align: "right", render: (f) => `${f.prazoMedio} dias` },
          { label: "Encomendas", align: "right", render: (f) => state.encomendas.filter((e) => e.fornecedor === f.codigo).length },
          ...(verCustos
            ? [{ label: "Valor encomendado", align: "right" as const, render: (f: (typeof rows)[number]) => money(sum(state.encomendas.filter((e) => e.fornecedor === f.codigo), total)) }]
            : []),
        ]}
      />
    </>
  );
}

export function Rececoes() {
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const rows = state.rececoes.filter((r) => matches(query, r.numero, r.encomenda, r.guia));
  const unidades = sum(rows, (r) => sum(r.linhas, (l) => l.quantidade));
  return (
    <>
      <PageHeader eyebrow="OIF · Compras" title="Receções" description="Entradas de material por encomenda, com a guia do fornecedor e as quantidades recebidas." />
      <div className="metrics four">
        <Metric label="Receções registadas" value={state.rececoes.length} icon={<PackageCheck size={16} />} />
        <Metric label="Encomendas parcialmente recebidas" value={state.encomendas.filter((e) => e.estado === "Recebida parcial").length} accent="amber" />
        <Metric label="Encomendas por receber" value={state.encomendas.filter((e) => ["Enviada", "Confirmada"].includes(e.estado)).length} accent="accent" />
        <Metric label="Unidades recebidas" value={num(unidades, 0)} />
      </div>
      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar receção, encomenda ou guia…" />
        <span className="filter-total">{rows.length} receções</span>
      </div>
      <Table
        rows={rows}
        rowKey={(r) => r.numero}
        empty="Ainda não há receções registadas. Registe-as a partir da encomenda em Compras."
        columns={[
          { label: "Receção", render: (r) => <b>{r.numero}</b> },
          { label: "Encomenda", render: (r) => r.encomenda },
          { label: "Fornecedor", render: (r) => state.fornecedores.find((f) => f.codigo === state.encomendas.find((e) => e.numero === r.encomenda)?.fornecedor)?.nome ?? "Não indicado" },
          { label: "Data", render: (r) => date(r.data) },
          { label: "Guia", render: (r) => r.guia || <span className="muted">Não indicado</span> },
          {
            label: "Artigos recebidos",
            render: (r) => (
              <span className="wrap" style={{ display: "inline-block", maxWidth: 360 }}>
                {r.linhas.map((l) => `${num(l.quantidade, 2)} × ${state.artigos.find((a) => a.id === l.artigoId)?.codigo}`).join(" · ")}
              </span>
            ),
          },
        ]}
      />
    </>
  );
}
