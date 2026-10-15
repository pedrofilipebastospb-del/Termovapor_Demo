"use client";
import { PdfLink } from "./pdf-link";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Pencil, Plus, Zap } from "lucide-react";
import type { NF, NFEstado } from "@/types";
import { templateFor, type FieldDef } from "@/data/templates";
import { atualizarNF } from "@/lib/actions";
import { date } from "@/lib/format";
import { AnexarDocumentoModal } from "./forms";
import { NF_ESTADOS, StatusBadge } from "./status";
import { useStore } from "./store";
import { Badge, Button, Empty, Field, Modal, Note, Tabs } from "./ui";

function groupBySection(fields: FieldDef[]) {
  const map = new Map<string, FieldDef[]>();
  for (const f of fields) map.set(f.section, [...(map.get(f.section) ?? []), f]);
  return [...map.entries()];
}

function FieldInput({ def, value, onChange }: { def: FieldDef; value: string; onChange: (v: string) => void }) {
  if (def.type === "multiline") return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />;
  if (def.type === "combo" || def.type === "yesno")
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Não indicado</option>
        {(def.options ?? ["Sim", "Não"]).map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}

function Sections({ fields, values, editing, onChange }: { fields: FieldDef[]; values: Record<string, string>; editing: boolean; onChange: (k: string, v: string) => void }) {
  if (!fields.length) return <Empty>Sem campos para este separador.</Empty>;
  return (
    <div className="tech-sections">
      {groupBySection(fields).map(([section, defs]) => (
        <section className="tech-section" key={section}>
          <h3>{section}</h3>
          {editing ? (
            <div className="form-grid">
              {defs.map((d) => (
                <div key={d.key} className={d.type === "multiline" ? "span-all" : ""}>
                  <Field label={d.label}>
                    <FieldInput def={d} value={values[d.key] ?? ""} onChange={(v) => onChange(d.key, v)} />
                  </Field>
                </div>
              ))}
            </div>
          ) : (
            <dl className="kv-grid">
              {defs.map((d) => (
                <div key={d.key}>
                  <dt>{d.label}</dt>
                  <dd className={values[d.key] ? "" : "empty-value"}>{values[d.key] || "Por definir"}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}
    </div>
  );
}

export function NFEditor({ numero, onClose }: { numero: string; onClose: () => void }) {
  const { state, apply, user } = useStore();
  const nf = state.nfs.find((n) => n.numero === numero) as NF;
  const [tab, setTab] = useState("tecnica");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(nf?.campos ?? {});
  const [anexar, setAnexar] = useState(false);
  const fields = useMemo(() => (nf ? nf.camposOriginais ?? templateFor(nf.tipo, nf.registoTipo) : []), [nf]);
  if (!nf) return null;
  const tecnicos = fields.filter((f) => !f.electrical);
  const eletricos = fields.filter((f) => f.electrical);
  const docs = state.documentos.filter((d) => d.nf === nf.numero);
  const subs = state.nfs.filter((n) => n.principal === nf.numero);
  const pedido = state.pedidos.find((p) => p.quadroNf === nf.numero || p.nfs.includes(nf.numero));
  const preenchidos = fields.filter((f) => nf.campos[f.key]).length;

  const save = () => {
    apply((s) => atualizarNF(s, nf.numero, { campos: draft }, user), `Definição técnica do NF ${nf.numero} guardada.`);
    setEditing(false);
  };

  return (
    <Modal drawer wide title={`NF ${nf.numero} · ${nf.designacao}`} subtitle={`OE ${nf.oe} · ${nf.registoTipo} · ${nf.tipo}`} onClose={onClose}>
      <div className="modal-body">
        <div className="title-row" style={{ marginBottom: 16 }}>
          <StatusBadge estado={nf.estado} />
          {nf.principal && <Badge tone="blue">Sub-NF de NF {nf.principal}</Badge>}
          <span className="muted" style={{ fontSize: 11 }}>
            {preenchidos} de {fields.length} campos definidos
          </span>
          <span style={{ marginLeft: "auto" }}>
            <select
              aria-label="Estado do NF"
              value={nf.estado}
              onChange={(e) => apply((s) => atualizarNF(s, nf.numero, { estado: e.target.value as NFEstado }, user), `NF ${nf.numero}: estado alterado para ${e.target.value}.`)}
            >
              {NF_ESTADOS.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
          </span>
        </div>
        {subs.length > 0 && (
          <Note tone="blue">
            Sub-NF associados: {subs.map((s) => `NF ${s.numero} (${s.designacao})`).join(" · ")}
          </Note>
        )}
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: "tecnica", label: "Definição técnica" },
            { id: "eletrica", label: "Parte elétrica / Automação", count: eletricos.length ? eletricos.filter((f) => nf.campos[f.key]).length : undefined },
            { id: "docs", label: "Documentos", count: docs.length },
          ]}
        />
        {tab === "tecnica" && <Sections fields={tecnicos} values={editing ? draft : nf.campos} editing={editing} onChange={(k, v) => setDraft((d) => ({ ...d, [k]: v }))} />}
        {tab === "eletrica" && (
          <>
            {eletricos.length ? (
              <>
                <Note tone="blue" icon={<Zap size={15} />}>
                  Esta informação é a única parte da OE exportada para o OIF Elétrico (juntamente com o NF). Dados comerciais e mecânicos não são enviados.
                </Note>
                <Sections fields={eletricos} values={editing ? draft : nf.campos} editing={editing} onChange={(k, v) => setDraft((d) => ({ ...d, [k]: v }))} />
                {pedido && (
                  <p className="footnote">
                    Pedido associado: <b>{pedido.codigo}</b> · <StatusBadge estado={pedido.estado} />{" "}
                    {pedido.oif && (
                      <Link className="accent" href={`/oif/${pedido.oif}`}>
                        Abrir {pedido.oif}
                      </Link>
                    )}
                  </p>
                )}
              </>
            ) : (
              <Empty>Este tipo de equipamento não tem parte elétrica própria.</Empty>
            )}
          </>
        )}
        {tab === "docs" && (
          <>
            {docs.length ? (
              docs.map((d) => (
                <div className="doc-row" key={d.id}>
                  <span className="doc-icon">PDF</span>
                  <span>
                    <b>{d.descricao}</b>
                    <small>
                      {d.nome} · {d.categoria}{d.paginas ? ` · ${d.paginas} pág.` : ""}{d.data ? ` · ${date(d.data)}` : ""}
                    </small>
                  </span>
                  <PdfLink href={d.pdfUrl} />
                </div>
              ))
            ) : (
              <Empty>Sem documentos associados a este NF.</Empty>
            )}
            <div className="form-actions">
              <Button secondary onClick={() => setAnexar(true)}>
                <Plus size={14} /> Anexar documento
              </Button>
            </div>
          </>
        )}
        {tab !== "docs" && (
          <div className="form-actions">
            {editing ? (
              <>
                <Button
                  secondary
                  onClick={() => {
                    setDraft(nf.campos);
                    setEditing(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={save}>Guardar definição</Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setDraft(nf.campos);
                  setEditing(true);
                }}
              >
                <Pencil size={14} /> Editar campos
              </Button>
            )}
          </div>
        )}
      </div>
      {anexar && <AnexarDocumentoModal oe={nf.oe} nf={nf.numero} onClose={() => setAnexar(false)} />}
    </Modal>
  );
}
