"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CornerDownRight, FileText, Pencil, Plus, Printer, Send, Zap } from "lucide-react";
import type { DocCategoria, OE, OEEstado } from "@/types";
import { atualizarOE, enviarPedido } from "@/lib/actions";
import { date, dateTime, prazoLabel, sum } from "@/lib/format";
import { AdicionarNFModal, AnexarDocumentoModal, NovoPedidoModal } from "./forms";
import { NFEditor } from "./nf-editor";
import { OE_ESTADOS, PrioridadeBadge, StatusBadge } from "./status";
import { useStore } from "./store";
import { Badge, Button, DetailList, Empty, Field, Modal, Note, PageHeader, Panel, Table, Tabs } from "./ui";

const DOSSIER: { categoria: DocCategoria; pasta: string }[] = [
  { categoria: "Geral OE", pasta: "00_Documentos_OE" },
  { categoria: "Desenhos", pasta: "02_Desenhos" },
  { categoria: "Cálculos", pasta: "03_Calculos" },
  { categoria: "Certificados", pasta: "04_Certificados" },
  { categoria: "Manuais / fichas técnicas", pasta: "05_Manuais_Fichas_Tecnicas" },
  { categoria: "Elétrica / automação", pasta: "06_Eletrica_Automacao" },
  { categoria: "Inspeções / ensaios", pasta: "08_Inspecoes_Ensaios" },
  { categoria: "Documentação cliente", pasta: "09_Documentacao_Cliente" },
];

function EditarOEModal({ oe, onClose }: { oe: OE; onClose: () => void }) {
  const { apply, user } = useStore();
  const [form, setForm] = useState({ descricao: oe.descricao, dataEntrega: oe.dataEntrega, encomendaCliente: oe.encomendaCliente, orcamento: oe.orcamento, moradaInstalacao: oe.moradaInstalacao, responsavel: oe.responsavel, prioridade: oe.prioridade, observacoes: oe.observacoes });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Modal title={`Editar OE ${oe.numero}`} subtitle={oe.cliente} onClose={onClose} wide>
      <div className="modal-body">
        <Field label="Descrição">
          <input value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />
        </Field>
        <div className="form-grid three">
          <Field label="Data de entrega">
            <input type="date" value={form.dataEntrega} onChange={(e) => set("dataEntrega", e.target.value)} />
          </Field>
          <Field label="Encomenda do cliente">
            <input value={form.encomendaCliente} onChange={(e) => set("encomendaCliente", e.target.value)} />
          </Field>
          <Field label="Orçamento">
            <input value={form.orcamento} onChange={(e) => set("orcamento", e.target.value)} />
          </Field>
          <Field label="Responsável">
            <select value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)}>
              {["Nuno Barros", "Marta Lopes", "Ana Sousa"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioridade">
            <select value={form.prioridade} onChange={(e) => set("prioridade", e.target.value)}>
              <option>Normal</option>
              <option>Urgente</option>
            </select>
          </Field>
          <Field label="Morada de instalação">
            <input value={form.moradaInstalacao} onChange={(e) => set("moradaInstalacao", e.target.value)} />
          </Field>
        </div>
        <Field label="Observações">
          <textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
        </Field>
        <div className="form-actions">
          <Button secondary onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              apply((s) => atualizarOE(s, oe.numero, form as Partial<OE>, user), `OE ${oe.numero} atualizada.`);
              onClose();
            }}
          >
            Guardar alterações
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ImprimirModal({ oe, onClose }: { oe: OE; onClose: () => void }) {
  const { state, notify } = useStore();
  const [opcao, setOpcao] = useState<"so" | "cert" | "todos">("so");
  const docs = state.documentos.filter((d) => d.oe === oe.numero && d.nome.endsWith(".pdf"));
  const incluidos = opcao === "so" ? [] : opcao === "cert" ? docs.filter((d) => d.categoria === "Certificados") : docs;
  const paginas = 3 + state.nfs.filter((n) => n.oe === oe.numero).length + sum(incluidos, (d) => d.paginas);
  return (
    <Modal title={`Imprimir OE ${oe.numero}`} subtitle="Composição do dossier de impressão" onClose={onClose}>
      <div className="modal-body">
        <div className="choice-row" style={{ marginBottom: 18 }}>
          {(
            [
              ["so", "Só OE"],
              ["cert", "OE + Certificados PDF"],
              ["todos", "OE + Todos os PDF"],
            ] as const
          ).map(([id, label]) => (
            <button type="button" key={id} className={opcao === id ? "active" : ""} onClick={() => setOpcao(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="doc-row">
          <span className="doc-icon">OE</span>
          <span>
            <b>Folha da OE {oe.numero}</b>
            <small>Dados gerais, equipamentos e definição técnica de cada NF</small>
          </span>
        </div>
        {incluidos.map((d) => (
          <div className="doc-row" key={d.id}>
            <span className="doc-icon">PDF</span>
            <span>
              <b>{d.descricao}</b>
              <small>
                {d.nome} · {d.paginas} pág.
              </small>
            </span>
          </div>
        ))}
        <Note tone="blue">
          Dossier combinado com cerca de <b>{paginas} páginas</b>, guardado em DOSSIER_OE. Documentos que não sejam PDF ficam arquivados mas não são incorporados.
        </Note>
        <div className="form-actions">
          <Button secondary onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              notify(`Dossier da OE ${oe.numero} gerado (simulação · ${paginas} páginas).`);
              onClose();
            }}
          >
            <Printer size={14} /> Gerar dossier
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function OEDetail({ numero, tabInicial }: { numero: number; tabInicial?: string }) {
  const { state, apply, user } = useStore();
  const [tab, setTab] = useState(tabInicial ?? "resumo");
  const [modal, setModal] = useState<"" | "editar" | "nf" | "pedido" | "doc" | "imprimir">("");
  const [nfAberto, setNfAberto] = useState<string | null>(null);
  const oe = state.oes.find((o) => o.numero === numero);

  if (!oe)
    return (
      <>
        <Link href="/oe" className="back-link">
          <ArrowLeft size={14} /> Ordens de Execução
        </Link>
        <PageHeader title={`OE ${numero} não encontrada`} description="Verifique o número ou regresse à lista de Ordens de Execução." />
      </>
    );

  const nfs = state.nfs.filter((n) => n.oe === oe.numero).sort((a, b) => a.numero.localeCompare(b.numero, "pt", { numeric: true }));
  const pedidos = state.pedidos.filter((p) => p.oe === oe.numero);
  const docs = state.documentos.filter((d) => d.oe === oe.numero);
  const refs = new Set([`OE ${oe.numero}`, ...nfs.map((n) => `NF ${n.numero}`), ...pedidos.map((p) => p.codigo), ...pedidos.map((p) => p.oif ?? "")]);
  const historico = state.auditoria.filter((a) => refs.has(a.referencia));
  const cliente = state.clientes.find((c) => c.codigo === oe.clienteCodigo);

  return (
    <>
      <Link href="/oe" className="back-link">
        <ArrowLeft size={14} /> Ordens de Execução
      </Link>
      <PageHeader
        eyebrow={`${oe.cliente} · N.º SAGE ${oe.clienteCodigo}`}
        title={`OE ${oe.numero}`}
        description={oe.descricao}
        actions={
          <>
            <select
              aria-label="Estado da OE"
              value={oe.estado}
              onChange={(e) => apply((s) => atualizarOE(s, oe.numero, { estado: e.target.value as OEEstado }, user), `OE ${oe.numero}: estado alterado para ${e.target.value}.`)}
            >
              {OE_ESTADOS.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
            <Button secondary onClick={() => setModal("imprimir")}>
              <Printer size={15} /> Imprimir OE
            </Button>
            <Button onClick={() => setModal("editar")}>
              <Pencil size={14} /> Editar
            </Button>
          </>
        }
      />
      <div className="metrics four">
        <div className="metric">
          <div className="metric-label">Estado</div>
          <strong style={{ fontSize: 18 }}>
            <StatusBadge estado={oe.estado} /> <PrioridadeBadge prioridade={oe.prioridade} />
          </strong>
          <small>Responsável: {oe.responsavel}</small>
        </div>
        <div className="metric">
          <div className="metric-label">Entrega</div>
          <strong>{date(oe.dataEntrega)}</strong>
          <small>{["Concluída", "Fechada", "Anulada"].includes(oe.estado) ? `OE ${oe.estado.toLowerCase()}` : prazoLabel(oe.dataEntrega)}</small>
        </div>
        <div className="metric">
          <div className="metric-label">Equipamentos / NF</div>
          <strong>{nfs.length}</strong>
          <small>
            {nfs.filter((n) => n.estado === "Concluído").length} concluídos · {nfs.filter((n) => n.principal).length} sub-NF
          </small>
        </div>
        <div className="metric">
          <div className="metric-label">Pedidos elétricos</div>
          <strong>{pedidos.length}</strong>
          <small>{pedidos.filter((p) => p.estado === "Devolvido à OE").length} devolvidos pelo OIF</small>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "resumo", label: "Resumo" },
          { id: "nf", label: "Equipamentos / NF", count: nfs.length },
          { id: "eletrica", label: "Eletricidade / Automação", count: pedidos.length },
          { id: "dossier", label: "Documentos", count: docs.length },
          { id: "geral", label: "Informação da ordem" },
          { id: "historico", label: "Histórico", count: historico.length },
        ]}
      />

      {tab === "resumo" && (
        <>
          <div className="grid-main">
            <Panel title="Acompanhamento da ordem" subtitle={oe.descricao}>
              <div className="panel-body">
                <div className="kv-grid">
                  <div><dt>Prioridade</dt><dd><PrioridadeBadge prioridade={oe.prioridade} /></dd></div>
                  <div><dt>Data de criação</dt><dd>{date(oe.dataCriacao)}</dd></div>
                  <div><dt>Prazo de entrega</dt><dd>{date(oe.dataEntrega)}</dd></div>
                  <div><dt>Responsável</dt><dd>{oe.responsavel}</dd></div>
                  <div><dt>Encomenda do cliente</dt><dd>{oe.encomendaCliente || "—"}</dd></div>
                  <div><dt>Orçamento Termovapor</dt><dd>{oe.orcamento || "—"}</dd></div>
                  <div><dt>Morada de instalação</dt><dd>{oe.moradaInstalacao}</dd></div>
                  <div><dt>Documentos</dt><dd>{docs.length} no dossier</dd></div>
                </div>
                {oe.observacoes && <Note tone="neutral">{oe.observacoes}</Note>}
              </div>
            </Panel>
            <Panel title="Eletricidade deste trabalho" subtitle="Fase da OIF em tempo real, sem custos">
              <div className="activity-list">
                {pedidos.map((p) => {
                  const o = state.oifs.find((x) => x.numero === p.oif);
                  return (
                    <Link key={p.codigo} href={`/pedidos?p=${p.codigo}`}>
                      <span style={{ minWidth: 0 }}>
                        <b className="mono">{p.codigo}</b>
                        <small>{p.titulo}</small>
                      </span>
                      <span className="attention-meta">
                        <StatusBadge estado={o ? o.estado : p.estado} />
                        <small>{o ? o.numero : "Por enviar"}</small>
                      </span>
                    </Link>
                  );
                })}
                {!pedidos.length && (
                  <p className="muted" style={{ fontSize: 12, padding: "16px 0" }}>
                    Sem pedidos elétricos. Crie-os no separador Eletricidade / Automação.
                  </p>
                )}
              </div>
            </Panel>
          </div>
          <Panel
            title="Equipamentos associados"
            subtitle={`${nfs.length} registos · ${nfs.filter((n) => n.principal).length} sub-NF`}
            actions={
              <Button small secondary onClick={() => setModal("nf")}>
                <Plus size={14} /> Adicionar
              </Button>
            }
          >
            <div className="activity-list">
              {nfs.map((n) => (
                <button type="button" key={n.numero} onClick={() => setNfAberto(n.numero)} className="list-button">
                  <span style={{ minWidth: 0 }}>
                    <b>
                      {n.principal && <CornerDownRight size={12} className="muted" />} NF {n.numero} · {n.tipo}
                    </b>
                    <small>{n.designacao}</small>
                  </span>
                  <span className="attention-meta">
                    <StatusBadge estado={n.estado} />
                    <ArrowRight size={15} />
                  </span>
                </button>
              ))}
              {!nfs.length && <p className="muted" style={{ fontSize: 12, padding: "16px 0" }}>Ainda sem equipamentos.</p>}
            </div>
          </Panel>
        </>
      )}

      {tab === "geral" && (
        <div className="grid-two">
          <Panel title="Cliente e encomenda">
            <div className="panel-body">
              <DetailList
                items={[
                  ["Cliente", oe.cliente],
                  ["N.º SAGE", <span className="mono" key="s">{oe.clienteCodigo}</span>],
                  ["NIF", cliente?.nif],
                  ["Morada do cliente", oe.moradaCliente],
                  ["Morada de instalação", oe.moradaInstalacao],
                  ["Encomenda do cliente", oe.encomendaCliente],
                  ["Orçamento", oe.orcamento],
                ]}
              />
            </div>
          </Panel>
          <Panel title="Planeamento">
            <div className="panel-body">
              <DetailList
                items={[
                  ["Data de criação", date(oe.dataCriacao)],
                  ["Data de entrega", date(oe.dataEntrega)],
                  ["Responsável", oe.responsavel],
                  ["Prioridade", <PrioridadeBadge key="p" prioridade={oe.prioridade} />],
                  ["Estado", <StatusBadge key="e" estado={oe.estado} />],
                  ["Pasta da OE", <span className="mono" key="f">OE_{oe.numero}\</span>],
                  ["Observações", oe.observacoes],
                ]}
              />
            </div>
          </Panel>
        </div>
      )}

      {tab === "nf" && (
        <Panel
          title="Equipamentos e intervenções"
          subtitle="Cada equipamento recebe um Número de Fabrico (NF). Os componentes associados recebem sub-NF (ex.: 1112/2)."
          actions={
            <Button small onClick={() => setModal("nf")}>
              <Plus size={14} /> Adicionar
            </Button>
          }
        >
          <Table
            rows={nfs}
            rowKey={(n) => n.numero}
            onRow={(n) => setNfAberto(n.numero)}
            empty="Ainda não existem equipamentos nesta OE."
            columns={[
              {
                label: "NF",
                render: (n) => (
                  <span className="cell-main">
                    {n.principal && <CornerDownRight size={14} className="muted" />}
                    <b>NF {n.numero}</b>
                  </span>
                ),
              },
              { label: "Registo", render: (n) => <span className="muted">{n.registoTipo}</span> },
              { label: "Tipo", render: (n) => n.tipo },
              { label: "Designação", render: (n) => <b>{n.designacao}</b> },
              { label: "Estado", render: (n) => <StatusBadge estado={n.estado} /> },
              { label: "Documentos", align: "center", render: (n) => state.documentos.filter((d) => d.nf === n.numero).length || "—" },
              { label: "OIF", render: (n) => (n.campos.el_oif ? <Link className="accent" href={`/oif/${n.campos.el_oif}`} onClick={(e) => e.stopPropagation()}>{n.campos.el_oif}</Link> : <span className="muted">—</span>) },
            ]}
          />
        </Panel>
      )}

      {tab === "eletrica" && (
        <>
          <Note tone="blue" icon={<Zap size={15} />}>
            <span>
              O pedido envia ao OIF apenas o <b>NF</b> e a <b>informação elétrica / automação</b>. Ao ser recebido, o OIF cria automaticamente o quadro e a OIF. No fim, a OIF é concluída e devolvida à OE com o esquema final.
            </span>
          </Note>
          <Panel
            title="Pedidos elétricos / automação"
            actions={
              <Button small onClick={() => setModal("pedido")}>
                <Plus size={14} /> Novo pedido
              </Button>
            }
          >
            <Table
              rows={pedidos}
              rowKey={(p) => p.codigo}
              empty="Sem pedidos elétricos nesta OE."
              columns={[
                { label: "Pedido", render: (p) => <span><b>{p.codigo}</b><small className="block">{p.titulo}</small></span> },
                { label: "Quadro", render: (p) => `NF ${p.quadroNf}` },
                { label: "Equipamentos", render: (p) => p.nfs.map((n) => `NF ${n}`).join(", ") || "—" },
                { label: "HMI", render: (p) => p.hmi },
                { label: "Revisão", align: "center", render: (p) => `R${String(p.revisao).padStart(2, "0")}` },
                { label: "Estado", render: (p) => <StatusBadge estado={p.estado} /> },
                { label: "Fase da OIF", render: (p) => { const o = state.oifs.find((x) => x.numero === p.oif); return o ? <StatusBadge estado={o.estado} /> : <span className="muted">—</span>; } },
                {
                  label: "OIF",
                  align: "right",
                  render: (p) =>
                    p.oif ? (
                      <Link className="button secondary small" href={`/oif/${p.oif}`}>
                        {p.oif}
                      </Link>
                    ) : (
                      <Button small onClick={() => apply((s) => enviarPedido(s, p.codigo, user)[0], `Pedido ${p.codigo} enviado. OIF criada automaticamente.`)}>
                        <Send size={13} /> Enviar ao OIF
                      </Button>
                    ),
                },
              ]}
            />
          </Panel>
        </>
      )}

      {tab === "dossier" && (
        <>
          <div className="section-top">
            <div>
              <h2>Dossier final</h2>
              <p>Documentos organizados pelas pastas normalizadas do dossier da OE.</p>
            </div>
            <div className="header-actions">
              <Button secondary small onClick={() => setModal("imprimir")}>
                <Printer size={14} /> Imprimir / dossier
              </Button>
              <Button small onClick={() => setModal("doc")}>
                <Plus size={14} /> Anexar documento
              </Button>
            </div>
          </div>
          <div className="dossier-grid" style={{ marginBottom: 22 }}>
            {DOSSIER.map(({ categoria, pasta }) => {
              const n = docs.filter((d) => d.categoria === categoria).length;
              return (
                <div key={pasta} className={`dossier-card ${n ? "" : "empty"}`}>
                  <small className="mono">{pasta}</small>
                  <b>{categoria}</b>
                  <small>{n ? `${n} ${n === 1 ? "documento" : "documentos"}` : "Sem documentos"}</small>
                </div>
              );
            })}
          </div>
          <Panel title="Documentos da OE" subtitle={`${docs.length} documentos · ${sum(docs, (d) => d.paginas)} páginas`}>
            <div className="panel-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
              {docs.length ? (
                docs.map((d) => (
                  <div className="doc-row" key={d.id}>
                    <span className="doc-icon">PDF</span>
                    <span>
                      <b>{d.descricao}</b>
                      <small>
                        {d.nome} · {d.paginas} pág. · {date(d.data)}
                      </small>
                    </span>
                    <span className="title-row">
                      {d.nf && <Badge tone="blue">NF {d.nf}</Badge>}
                      <Badge>{d.categoria}</Badge>
                      <FileText size={15} className="muted" />
                    </span>
                  </div>
                ))
              ) : (
                <Empty>Ainda não há documentos nesta OE.</Empty>
              )}
            </div>
          </Panel>
        </>
      )}

      {tab === "historico" && (
        <Table
          rows={historico}
          rowKey={(a) => a.id}
          pageSize={15}
          empty="Sem registos de auditoria."
          columns={[
            { label: "Data", render: (a) => dateTime(a.data) },
            { label: "Referência", render: (a) => <b>{a.referencia}</b> },
            { label: "Ação", render: (a) => a.acao },
            { label: "Detalhe", render: (a) => <span className="muted">{a.detalhe || "—"}</span> },
            { label: "Utilizador", render: (a) => a.utilizador },
          ]}
        />
      )}

      {modal === "editar" && <EditarOEModal oe={oe} onClose={() => setModal("")} />}
      {modal === "imprimir" && <ImprimirModal oe={oe} onClose={() => setModal("")} />}
      {modal === "nf" && <AdicionarNFModal oe={oe} onClose={() => setModal("")} onCreated={(n) => setNfAberto(n)} />}
      {modal === "pedido" && <NovoPedidoModal oe={oe} onClose={() => setModal("")} />}
      {modal === "doc" && <AnexarDocumentoModal oe={oe.numero} onClose={() => setModal("")} />}
      {nfAberto && <NFEditor numero={nfAberto} onClose={() => setNfAberto(null)} />}
    </>
  );
}
