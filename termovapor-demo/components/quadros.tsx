"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Cpu, FileSearch, FileText, FileUp, Link2, Plus, RefreshCw, Trash2 } from "lucide-react";
import type { LinhaMaterial, Quadro } from "@/types";
import { associarArtigo, associarPDF, atualizarArtigo, atualizarLinha, criarArtigoDeLinha, extrairMateriais, removerLinha } from "@/lib/actions";
import { linhasSemArtigo } from "@/lib/engine";
import { date, matches, money } from "@/lib/format";
import { StatusBadge } from "./status";
import { useStore } from "./store";
import { Badge, Button, Empty, Field, Modal, Note, PageHeader, Panel, SearchInput, Table } from "./ui";

const CATEGORIAS = ["Proteção", "Comando", "Relés", "Automação", "Alimentação", "Variadores", "Instrumentação", "Sinalização", "Cablagem", "Envolventes", "Medida"];

function AssociarModal({ quadro, linha, onClose }: { quadro: Quadro; linha: LinhaMaterial; onClose: () => void }) {
  const { state, apply, user, verCustos } = useStore();
  const [query, setQuery] = useState(linha.refExtraida.slice(0, 4));
  const [sel, setSel] = useState<string>(linha.artigoId ?? "");
  const [custo, setCusto] = useState("");
  const [padrao, setPadrao] = useState(false);
  const lista = useMemo(() => state.artigos.filter((a) => matches(query, a.codigo, a.descricao, a.referencia, a.marca)).slice(0, 30), [state.artigos, query]);
  const artigo = state.artigos.find((a) => a.id === sel);
  return (
    <Modal title="Associar artigo cadastrado" subtitle={`${linha.designacao} · ${linha.refExtraida || "sem referência"} — ${linha.descricaoExtraida}`} onClose={onClose} wide>
      <div className="modal-body">
        <div className="filter-bar">
          <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar artigo por código, referência, marca ou descrição…" />
        </div>
        <Table
          rows={lista}
          rowKey={(a) => a.id}
          pageSize={8}
          onRow={(a) => {
            setSel(a.id);
            setCusto(String(a.custo));
          }}
          rowClass={(a) => (a.id === sel ? "row-selected" : "")}
          empty="Nenhum artigo encontrado. Pode criar um novo artigo a partir da linha."
          columns={[
            { label: "Código", render: (a) => <b>{a.codigo}</b> },
            { label: "Descrição", render: (a) => a.descricao },
            { label: "Marca / referência", render: (a) => <span className="muted">{a.marca} · {a.referencia}</span> },
            { label: "Stock", align: "right", render: (a) => a.stock - a.reservado },
            { label: "", render: (a) => (a.id === sel ? <Badge tone="blue">Selecionado</Badge> : null) },
          ]}
        />
        {artigo && verCustos && (
          <div className="form-grid" style={{ marginTop: 16 }}>
            <Field label="Custo interno unitário (€)" hint={`Custo padrão atual: ${money(artigo.custo)}`}>
              <input type="number" step="0.01" min={0} value={custo} onChange={(e) => setCusto(e.target.value)} />
            </Field>
            <label className="checkbox-label" style={{ alignSelf: "center" }}>
              <input type="checkbox" checked={padrao} onChange={(e) => setPadrao(e.target.checked)} /> Atualizar também o custo padrão do artigo
            </label>
          </div>
        )}
        <div className="form-actions">
          <Button secondary onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!artigo}
            onClick={() => {
              apply((s) => {
                let next = associarArtigo(s, quadro.id, linha.id, sel, user);
                if (padrao && Number(custo) >= 0 && Number(custo) !== artigo?.custo) next = atualizarArtigo(next, sel, { custo: Number(custo) }, user, "Custo padrão atualizado");
                return next;
              }, `Linha ${linha.designacao} associada a ${artigo?.codigo}.`);
              onClose();
            }}
          >
            <Link2 size={14} /> Associar artigo selecionado
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function CriarArtigoModal({ quadro, linha, onClose }: { quadro: Quadro; linha: LinhaMaterial; onClose: () => void }) {
  const { apply, user } = useStore();
  const [form, setForm] = useState({ descricao: linha.descricaoExtraida, marca: linha.fabricante, referencia: linha.refExtraida, categoria: "Medida", custo: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Modal title="Criar e associar artigo" subtitle="Cadastro a partir da linha extraída do PDF SEE" onClose={onClose}>
      <div className="modal-body">
        <Field label="Descrição">
          <input value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />
        </Field>
        <div className="form-grid">
          <Field label="Marca / fabricante">
            <input value={form.marca} onChange={(e) => set("marca", e.target.value)} />
          </Field>
          <Field label="Referência do fabricante">
            <input value={form.referencia} onChange={(e) => set("referencia", e.target.value)} />
          </Field>
          <Field label="Categoria">
            <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Custo interno unitário (€)">
            <input type="number" min={0} step="0.01" value={form.custo} onChange={(e) => set("custo", e.target.value)} placeholder="0,00" />
          </Field>
        </div>
        <Note tone="amber">O artigo é criado com stock zero. A OIF mostrará a falta real até haver entrada em stock.</Note>
        <div className="form-actions">
          <Button secondary onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!form.descricao || !form.referencia}
            onClick={() => {
              apply((s) => criarArtigoDeLinha(s, quadro.id, linha.id, { descricao: form.descricao, marca: form.marca, referencia: form.referencia, categoria: form.categoria, custo: Number(form.custo) || 0 }, user), `Artigo ${form.referencia} cadastrado e associado.`);
              onClose();
            }}
          >
            <Plus size={14} /> Criar e associar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function QuadroDetail({ quadro }: { quadro: Quadro }) {
  const { state, apply, user, verComercial } = useStore();
  const [associar, setAssociar] = useState<LinhaMaterial | null>(null);
  const [criar, setCriar] = useState<LinhaMaterial | null>(null);
  const oif = state.oifs.find((o) => o.quadroId === quadro.id);
  const sem = linhasSemArtigo(quadro);
  const bloqueado = !!oif && oif.etapas.length >= 3;
  const arts = new Map(state.artigos.map((a) => [a.id, a]));
  return (
    <>
      <Panel
        title={quadro.codigo}
        subtitle={verComercial ? `${quadro.descricao} · ${quadro.cliente}` : quadro.descricao}
        actions={oif && <Link className="button secondary small" href={`/oif/${oif.numero}`}>{oif.numero}</Link>}
      >
        <div className="panel-body">
          <div className="kv-grid" style={{ marginBottom: 16 }}>
            <div><dt>OE / NF</dt><dd>OE {quadro.oe} · NF {quadro.nf}</dd></div>
            <div><dt>N.º esquema / revisão</dt><dd>{quadro.esquema} · {quadro.revisao}</dd></div>
            <div><dt>Extração</dt><dd>{quadro.extraidoEm ? date(quadro.extraidoEm) : "Por fazer"}</dd></div>
            <div><dt>Estado da OIF</dt><dd>{oif ? <StatusBadge estado={oif.estado} /> : "—"}</dd></div>
          </div>
          <div className="doc-row" style={{ border: "1px solid var(--line)", borderRadius: 6, padding: 12 }}>
            <span className="doc-icon">PDF</span>
            <span>
              <b>{quadro.pdf || "PDF completo do SEE Electrical por associar"}</b>
              <small>Um único PDF completo; a página &quot;Lista de Equipamentos&quot; é lida automaticamente.</small>
            </span>
            <span className="title-row">
              {!quadro.pdf ? (
                <Button small onClick={() => apply((s) => associarPDF(s, quadro.id, user), "PDF SEE associado ao quadro.")}>
                  <FileUp size={13} /> Selecionar PDF
                </Button>
              ) : (
                <>
                  <FileText size={15} className="muted" />
                  <Button small secondary={!!quadro.linhas.length} disabled={bloqueado} onClick={() => apply((s) => extrairMateriais(s, quadro.id, user), "Lista de equipamentos extraída do PDF.")}>
                    {quadro.linhas.length ? <RefreshCw size={13} /> : <FileSearch size={13} />} {quadro.linhas.length ? "Reextrair" : "Extrair materiais"}
                  </Button>
                </>
              )}
            </span>
          </div>
        </div>
      </Panel>
      {sem.length > 0 && (
        <Note tone="amber" icon={<AlertTriangle size={15} />}>
          <span>
            <b>{sem.length} linhas a amarelo:</b> artigos extraídos do PDF ainda não cadastrados. A OIF não avança enquanto existirem linhas sem artigo associado.
          </span>
        </Note>
      )}
      {bloqueado && <Note tone="blue">Projeto SEE já validado na {oif?.numero}: a lista de materiais fica protegida contra reextração.</Note>}
      {quadro.linhas.length ? (
        <Table
          rows={quadro.linhas}
          rowKey={(l) => l.id}
          pageSize={50}
          rowClass={(l) => (l.artigoId ? "" : "row-warning")}
          columns={[
            { label: "Designação", render: (l) => <b className="mono">{l.designacao}</b> },
            { label: "Ref. fabricante", render: (l) => <span className="mono">{l.refExtraida || "—"}</span> },
            { label: "Descrição", render: (l) => <span><b>{l.artigoId ? arts.get(l.artigoId)?.descricao : l.descricaoExtraida}</b><small className="block">{l.fabricante}</small></span> },
            { label: "Artigo", render: (l) => (l.artigoId ? <Badge tone="green">{arts.get(l.artigoId)?.codigo} · cadastrado</Badge> : <Badge tone="amber">NÃO CADASTRADO</Badge>) },
            {
              label: "Qtd.",
              align: "right",
              render: (l) =>
                bloqueado ? (
                  l.quantidade
                ) : (
                  <input type="number" min={1} aria-label={`Quantidade ${l.designacao}`} value={l.quantidade} style={{ width: 70, minHeight: 30, padding: "4px 8px" }} onChange={(e) => apply((s) => atualizarLinha(s, quadro.id, l.id, Math.max(1, Number(e.target.value) || 1)))} />
                ),
            },
            {
              label: "",
              align: "right",
              render: (l) =>
                bloqueado ? null : (
                  <span className="title-row" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                    {!l.artigoId && (
                      <Button small onClick={() => setCriar(l)}>
                        <Plus size={12} /> Criar artigo
                      </Button>
                    )}
                    <Button small secondary onClick={() => setAssociar(l)}>
                      <Link2 size={12} /> {l.artigoId ? "Trocar" : "Associar"}
                    </Button>
                    <button type="button" className="icon-button" aria-label="Remover linha" onClick={() => apply((s) => removerLinha(s, quadro.id, l.id), "Linha removida.")}>
                      <Trash2 size={14} />
                    </button>
                  </span>
                ),
            },
          ]}
        />
      ) : (
        <div className="panel">
          <Empty>{quadro.pdf ? "PDF associado. Extraia a lista de equipamentos para criar as linhas de material." : "Associe o PDF completo do SEE Electrical para começar."}</Empty>
        </div>
      )}
      {associar && <AssociarModal quadro={quadro} linha={associar} onClose={() => setAssociar(null)} />}
      {criar && <CriarArtigoModal quadro={quadro} linha={criar} onClose={() => setCriar(null)} />}
    </>
  );
}

export function Quadros({ initial }: { initial?: string }) {
  const { state } = useStore();
  const [sel, setSel] = useState(initial ?? state.quadros.find((q) => linhasSemArtigo(q).length || !q.linhas.length)?.id ?? state.quadros[0]?.id);
  const quadro = state.quadros.find((q) => q.id === sel);
  return (
    <>
      <PageHeader
        eyebrow="OIF Elétrico"
        title="Quadros / SEE PDF"
        description="Cada quadro tem um PDF completo do SEE Electrical. A lista de equipamentos é extraída e associada aos artigos cadastrados antes da reserva de material."
      />
      <div className="grid-side">
        <Panel title="Quadros" subtitle={`${state.quadros.length} quadros registados`}>
          <div className="activity-list">
            {[...state.quadros].reverse().map((q) => {
              const sem = linhasSemArtigo(q).length;
              const oif = state.oifs.find((o) => o.quadroId === q.id);
              return (
                <button type="button" key={q.id} onClick={() => setSel(q.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid #edf0f2", width: "100%", textAlign: "left", color: q.id === sel ? "var(--accent)" : undefined }}>
                  <span className="activity-icon" style={q.id === sel ? { background: "var(--accent-bg)", color: "var(--accent)", borderColor: "var(--accent-line)" } : undefined}>
                    <Cpu size={14} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <b style={{ color: "inherit" }}>{q.codigo}</b>
                    <small>
                      {oif?.numero ?? "Sem OIF"} · {q.linhas.length ? `${q.linhas.length} linhas` : q.pdf ? "por extrair" : "sem PDF"}
                    </small>
                  </span>
                  {sem > 0 && <span className="badge amber" style={{ marginLeft: "auto" }}>{sem}</span>}
                </button>
              );
            })}
          </div>
        </Panel>
        <div style={{ minWidth: 0 }}>{quadro ? <QuadroDetail key={quadro.id} quadro={quadro} /> : <Empty>Selecione um quadro.</Empty>}</div>
      </div>
    </>
  );
}
