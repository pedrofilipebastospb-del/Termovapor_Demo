"use client";
import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardCheck, Cpu, FileSearch, FileUp, Lock, PackageCheck, Play, Printer, RefreshCw, Truck, Undo2, Wrench } from "lucide-react";
import type { OIF } from "@/types";
import { aprovarTestes, associarPDF, atualizarCustosOIF, atualizarOIF, concluirMontagem, devolverOE, encomendarFaltas, extrairMateriais, iniciarMontagem, reservarMateriais, validarProjeto } from "@/lib/actions";
import { cobertura, custosOIF, linhasSemArtigo, OIF_ATIVA, pendenciasOIF, quadroDe } from "@/lib/engine";
import { date, dateTime, money, num, prazoLabel } from "@/lib/format";
import { oeHref } from "@/lib/access";
import { FlowStepper, StatusBadge } from "./status";
import { useStore } from "./store";
import { Badge, Button, DetailList, Field, Modal, Note, PageHeader, Panel, Table, Tabs } from "./ui";

function DevolverModal({ oif, onClose }: { oif: OIF; onClose: () => void }) {
  const { apply, user } = useStore();
  const [texto, setTexto] = useState("Quadro montado, cablado e ensaiado. Esquema final anexado à OE.");
  return (
    <Modal title={`Concluir ${oif.numero} e devolver à OE`} subtitle={`Pedido ${oif.pedido} · OE ${oif.oe}`} onClose={onClose}>
      <div className="modal-body">
        <Note tone="blue">Ao concluir: o material reservado é consumido do stock, o pedido passa a &quot;Devolvido à OE&quot; com nova revisão e o esquema final é arquivado no dossier da OE (06_Eletrica_Automacao).</Note>
        <Field label="Observações / definição final">
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} />
        </Field>
        <div className="form-actions">
          <Button secondary onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              apply((s) => devolverOE(s, oif.numero, texto, user), `${oif.numero} concluída e devolvida à OE ${oif.oe}.`);
              onClose();
            }}
          >
            <Undo2 size={14} /> Concluir e devolver à OE
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function EditarOIFModal({ oif, onClose }: { oif: OIF; onClose: () => void }) {
  const { apply, user, verCustos } = useStore();
  const [form, setForm] = useState({ responsavel: oif.responsavel, prazo: oif.prazo, observacoes: oif.observacoes, maoObra: String(oif.maoObra), outrosCustos: String(oif.outrosCustos) });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Modal title={`Editar ${oif.numero}`} onClose={onClose}>
      <div className="modal-body">
        <div className="form-grid">
          <Field label="Responsável">
            <select value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)}>
              <option value="">Por atribuir</option>
              {["Rui Ferreira", "Carlos Teixeira", "Hugo Martins"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Prazo">
            <input type="date" value={form.prazo} onChange={(e) => set("prazo", e.target.value)} />
          </Field>
          {verCustos && (
            <>
              <Field label="Mão de obra (€)" hint="Custo interno">
                <input type="number" min={0} step={10} value={form.maoObra} onChange={(e) => set("maoObra", e.target.value)} />
              </Field>
              <Field label="Outros custos (€)" hint="Custo interno">
                <input type="number" min={0} step={10} value={form.outrosCustos} onChange={(e) => set("outrosCustos", e.target.value)} />
              </Field>
            </>
          )}
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
              apply((s) => atualizarOIF(s, oif.numero, { responsavel: form.responsavel, prazo: form.prazo, observacoes: form.observacoes, ...(verCustos ? { maoObra: Number(form.maoObra) || 0, outrosCustos: Number(form.outrosCustos) || 0 } : {}) }, user), `${oif.numero} atualizada.`);
              onClose();
            }}
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Próxima ação do fluxo, apresentada como botão principal.
function NextAction({ oif, onDevolver }: { oif: OIF; onDevolver: () => void }) {
  const { state, apply, user } = useStore();
  const quadro = quadroDe(state, oif);
  const n = oif.etapas.length;
  const faltas = cobertura(state, oif).filter((c) => c.falta > 0).length;
  if (!OIF_ATIVA(oif)) return null;
  if (n === 2) {
    if (!quadro?.pdf)
      return (
        <Button onClick={() => apply((s) => associarPDF(s, oif.quadroId, user), "PDF completo do SEE Electrical associado ao quadro.")}>
          <FileUp size={15} /> Associar PDF SEE
        </Button>
      );
    if (!quadro.linhas.length)
      return (
        <Button onClick={() => apply((s) => extrairMateriais(s, oif.quadroId, user), "Lista de equipamentos extraída do PDF SEE.")}>
          <FileSearch size={15} /> Extrair materiais do PDF
        </Button>
      );
    if (linhasSemArtigo(quadro).length)
      return (
        <Link className="button" href={`/quadros?q=${quadro.id}`}>
          <AlertTriangle size={15} /> Resolver materiais não cadastrados
        </Link>
      );
    return (
      <Button onClick={() => apply((s) => validarProjeto(s, oif.numero, user), "Projeto SEE validado. Custos internos congelados na OIF.")}>
        <ClipboardCheck size={15} /> Validar projeto SEE
      </Button>
    );
  }
  if (n === 3)
    return (
      <Button
        onClick={() => {
          const [, f] = reservarMateriais(state, oif.numero, user);
          apply((s) => reservarMateriais(s, oif.numero, user)[0], f ? `Reserva parcial: ${f} ${f === 1 ? "artigo continua" : "artigos continuam"} em falta. OIF em "Aguarda material".` : "Todos os materiais reservados.");
        }}
      >
        <PackageCheck size={15} /> {faltas ? "Reservar stock disponível" : "Reservar materiais"}
      </Button>
    );
  if (oif.estado === "Material reservado")
    return (
      <Button onClick={() => apply((s) => iniciarMontagem(s, oif.numero, user), `${oif.numero}: montagem iniciada.`)}>
        <Play size={15} /> Iniciar montagem
      </Button>
    );
  if (oif.estado === "Em montagem")
    return (
      <Button onClick={() => apply((s) => concluirMontagem(s, oif.numero, user), `${oif.numero}: montagem concluída, segue para testes.`)}>
        <Wrench size={15} /> Concluir montagem
      </Button>
    );
  if (n === 5)
    return (
      <Button onClick={() => apply((s) => aprovarTestes(s, oif.numero, user), `${oif.numero}: testes aprovados.`)}>
        <CheckCircle2 size={15} /> Registar testes aprovados
      </Button>
    );
  if (n === 6)
    return (
      <Button onClick={onDevolver}>
        <Undo2 size={15} /> Concluir e devolver à OE
      </Button>
    );
  return null;
}

export function OIFDetail({ numero }: { numero: string }) {
  const { state, apply, user, verCustos, verComercial, perfil, notify } = useStore();
  const [tab, setTab] = useState("materiais");
  const [modal, setModal] = useState<"" | "devolver" | "editar">("");
  const oif = state.oifs.find((o) => o.numero === numero);
  if (!oif)
    return (
      <>
        <Link href="/oif" className="back-link">
          <ArrowLeft size={14} /> OIF / Produção
        </Link>
        <PageHeader title={`${numero} não encontrada`} description="Verifique o número da OIF." />
      </>
    );
  const quadro = quadroDe(state, oif);
  const pedido = state.pedidos.find((p) => p.codigo === oif.pedido);
  const rows = cobertura(state, oif);
  const faltas = rows.filter((r) => r.falta > 0);
  const porReservar = rows.filter((r) => r.porReservar > 0);
  const custos = custosOIF(state, oif);
  const pend = pendenciasOIF(state, oif);
  const historico = state.auditoria.filter((a) => a.referencia === oif.numero || a.referencia === quadro?.codigo || a.referencia === oif.pedido);
  const encomendas = state.encomendas.filter((e) => e.oif === oif.numero);
  const ok: string[] = [
    `Pedido ${oif.pedido} recebido da OE ${oif.oe}`,
    ...(quadro?.pdf ? [`PDF SEE associado (${quadro.pdf})`] : []),
    ...(quadro?.linhas.length ? [`${quadro.linhas.length} linhas de material na lista`] : []),
    ...(rows.length && !faltas.length && !porReservar.length && OIF_ATIVA(oif) && oif.etapas.length > 3 ? ["Todos os materiais reservados"] : []),
    ...oif.etapas.slice(2).map((e) => `${e.etapa} — ${date(e.data)}`),
  ];

  return (
    <>
      <Link href="/oif" className="back-link">
        <ArrowLeft size={14} /> OIF / Produção
      </Link>
      <PageHeader
        eyebrow={`${verComercial && quadro?.cliente ? `${quadro.cliente} · ` : ""}OE ${oif.oe} · NF ${oif.nf}`}
        title={oif.numero}
        description={quadro?.descricao}
        actions={
          <>
            <Button secondary onClick={() => notify(`${oif.numero} enviada para a impressora predefinida (simulação · sem preços).`)}>
              <Printer size={15} /> Imprimir OIF
            </Button>
            <Button secondary onClick={() => setModal("editar")}>
              Editar
            </Button>
            <NextAction oif={oif} onDevolver={() => setModal("devolver")} />
          </>
        }
      />

      <Panel title="Linha de tempo — da criação à devolução à OE" actions={<StatusBadge estado={oif.estado} />}>
        <div className="panel-body">
          <FlowStepper oif={oif} />
        </div>
      </Panel>

      <div className="grid-main">
        <div style={{ minWidth: 0 }}>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: "materiais", label: "Materiais / stock", count: rows.length },
              { id: "quadro", label: "Quadro / SEE" },
              { id: "custos", label: "Custos internos" },
              { id: "historico", label: "Histórico", count: historico.length },
            ]}
          />

          {tab === "materiais" && (
            <>
              {faltas.length > 0 && (
                <Note tone="red" icon={<AlertTriangle size={15} />}>
                  <span>
                    {faltas.length} {faltas.length === 1 ? "artigo tem" : "artigos têm"} falta real depois de considerar reservas e stock livre.
                    {encomendas.length ? ` Encomendas associadas: ${encomendas.map((e) => `${e.numero} (${e.estado.toLowerCase()})`).join(", ")}.` : ""}
                  </span>
                </Note>
              )}
              {!rows.length && <Note tone="amber">Ainda não há materiais associados. Extraia a lista do PDF SEE para calcular necessidades.</Note>}
              {rows.length > 0 && (
                <Table
                  rows={rows}
                  rowKey={(r) => r.artigo.id}
                  pageSize={40}
                  rowClass={(r) => (r.falta > 0 ? "row-warning" : "")}
                  columns={[
                    { label: "Artigo", render: (r) => <span><b>{r.artigo.descricao}</b><small className="block">{r.artigo.codigo} · {r.artigo.marca} {r.artigo.referencia}</small></span> },
                    { label: "Necessário", align: "right", render: (r) => num(r.necessario, 2) },
                    { label: "Reservado", align: "right", render: (r) => (r.reservado ? <b className="positive">{num(r.reservado, 2)}</b> : "—") },
                    { label: "Stock livre", align: "right", hint: "Stock físico menos todas as reservas ativas", render: (r) => num(r.livre, 2) },
                    { label: "Por reservar", align: "right", hint: "Há stock livre para cobrir esta quantidade", render: (r) => (r.porReservar ? <Badge tone="blue">{num(r.porReservar, 2)}</Badge> : "—") },
                    { label: "Falta real", align: "right", hint: "Necessidade sem cobertura depois de reservas e stock livre", render: (r) => (r.falta ? <Badge tone="red">{num(r.falta, 2)}</Badge> : <span className="muted">0</span>) },
                  ]}
                />
              )}
              {OIF_ATIVA(oif) && rows.length > 0 && (
                <div className="form-actions" style={{ borderTop: 0 }}>
                  {faltas.length > 0 && (
                    <Button
                      secondary
                      onClick={() => {
                        const [, enc] = encomendarFaltas(state, oif.numero, user);
                        apply((s) => encomendarFaltas(s, oif.numero, user)[0], `Encomenda ${enc} criada em rascunho para as faltas.`);
                      }}
                    >
                      <Truck size={14} /> Encomendar faltas
                    </Button>
                  )}
                  {oif.etapas.length >= 3 && porReservar.length > 0 && (
                    <Button onClick={() => apply((s) => reservarMateriais(s, oif.numero, user)[0], "Reserva de materiais atualizada.")}>
                      <PackageCheck size={14} /> Reservar {porReservar.length} artigos
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {tab === "quadro" && quadro && (
            <Panel title={quadro.codigo} subtitle={quadro.descricao} actions={<Link className="button secondary small" href={`/quadros?q=${quadro.id}`}><Cpu size={13} /> Abrir quadro</Link>}>
              <div className="panel-body">
                <DetailList
                  items={[
                    ["N.º esquema", quadro.esquema],
                    ["Revisão", quadro.revisao],
                    ["PDF completo SEE", quadro.pdf || <span className="danger" key="p">Por associar</span>],
                    ["Extração", quadro.extraidoEm ? date(quadro.extraidoEm) : "Por fazer"],
                    ["Linhas de material", quadro.linhas.length],
                    ["Não cadastradas", linhasSemArtigo(quadro).length ? <Badge tone="amber" key="n">{linhasSemArtigo(quadro).length} por associar</Badge> : "0"],
                  ]}
                />
                {pedido && (
                  <>
                    <h3 style={{ margin: "18px 0 6px", fontSize: 12 }}>Informação elétrica recebida da OE</h3>
                    <DetailList
                      items={[
                        ["Interface", pedido.hmi],
                        ["Alimentação", pedido.alimentacao],
                        ["Motores", pedido.motores],
                        ["Sondas", pedido.sondas],
                        ["Requisitos", pedido.requisitos],
                      ]}
                    />
                  </>
                )}
              </div>
            </Panel>
          )}

          {tab === "custos" &&
            (verCustos ? (
              <>
                <div className="title-row" style={{ marginBottom: 12 }}>
                  <span className="internal-label">
                    <Lock size={11} /> DOCUMENTO INTERNO — NÃO ENVIAR AO CLIENTE
                  </span>
                </div>
                <div className="cost-box">
                  <div>
                    <span>Materiais</span>
                    <strong>{money(custos.materiais)}</strong>
                  </div>
                  <div>
                    <span>Mão de obra</span>
                    <strong>{money(custos.maoObra)}</strong>
                  </div>
                  <div>
                    <span>Outros custos</span>
                    <strong>{money(custos.outros)}</strong>
                  </div>
                  <div>
                    <span>Custo total do quadro</span>
                    <strong>{money(custos.total)}</strong>
                  </div>
                </div>
                <Table
                  rows={rows}
                  rowKey={(r) => r.artigo.id}
                  pageSize={40}
                  columns={[
                    { label: "Artigo", render: (r) => <span><b>{r.artigo.descricao}</b><small className="block">{r.artigo.codigo}</small></span> },
                    { label: "Qtd.", align: "right", render: (r) => num(r.necessario, 2) },
                    { label: "Custo unit. (OIF)", align: "right", hint: "Custo congelado na validação do projeto", render: (r) => money(r.custo) },
                    { label: "Custo atual artigo", align: "right", render: (r) => <span className={r.custo !== r.artigo.custo ? "accent" : "muted"}>{money(r.artigo.custo)}</span> },
                    { label: "Total linha", align: "right", render: (r) => <b>{money(r.custo * r.necessario)}</b> },
                  ]}
                  footer={["Total materiais", "", "", "", money(custos.materiais)]}
                />
                <div className="form-actions" style={{ borderTop: 0 }}>
                  <Button secondary onClick={() => notify("Relatório interno de custos enviado para impressão (simulação · documento interno).")}>
                    <Printer size={14} /> Imprimir custos internos
                  </Button>
                  <Button secondary onClick={() => apply((s) => atualizarCustosOIF(s, oif.numero, user), "Custos da OIF atualizados com os custos atuais dos artigos.")}>
                    <RefreshCw size={14} /> Atualizar custos dos artigos
                  </Button>
                </div>
              </>
            ) : (
              <div className="panel">
                <div className="restricted">
                  <Lock size={22} />
                  <b>Informação reservada</b>
                  O perfil &quot;Produção / OE&quot; não tem acesso aos custos internos. A OIF operacional nunca apresenta preços.
                </div>
              </div>
            ))}

          {tab === "historico" && (
            <Table
              rows={historico}
              rowKey={(a) => a.id}
              empty="Sem registos."
              columns={[
                { label: "Data", render: (a) => dateTime(a.data) },
                { label: "Referência", render: (a) => <b>{a.referencia}</b> },
                { label: "Ação", render: (a) => a.acao },
                { label: "Detalhe", render: (a) => <span className="muted">{a.detalhe || "—"}</span> },
                { label: "Utilizador", render: (a) => a.utilizador },
              ]}
            />
          )}
        </div>

        <div className="stack">
          <Panel title="Identificação / estado">
            <div className="panel-body">
              <DetailList
                items={[
                  ["Estado", <StatusBadge key="e" estado={oif.estado} />],
                  ["Responsável", oif.responsavel || <span className="danger" key="r">Por atribuir</span>],
                  ["Prazo", `${date(oif.prazo)}${OIF_ATIVA(oif) ? ` · ${prazoLabel(oif.prazo)}` : ""}`],
                  ["Criada em", date(oif.criadaEm)],
                  ["Pedido da OE", pedido ? <Link key="p" className="accent" href={oeHref(perfil, oif.oe)}>{pedido.codigo} · R{String(pedido.revisao).padStart(2, "0")}</Link> : oif.pedido],
                  ["Observações", oif.observacoes],
                ]}
              />
            </div>
          </Panel>
          <Panel title="O que esta OIF já tem">
            <div className="panel-body">
              <ul className="check-list ok">
                {ok.map((t) => (
                  <li key={t}>
                    <CheckCircle2 size={14} /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
          <Panel title="O que falta / requer atenção">
            <div className="panel-body">
              {pend.length ? (
                <ul className="check-list warn">
                  {pend.map((t) => (
                    <li key={t}>
                      <AlertTriangle size={14} /> {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="positive" style={{ fontSize: 12 }}>
                  ✓ Sem pendências detetadas.
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {modal === "devolver" && <DevolverModal oif={oif} onClose={() => setModal("")} />}
      {modal === "editar" && <EditarOIFModal oif={oif} onClose={() => setModal("")} />}
    </>
  );
}
