"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Search } from "lucide-react";
import type { Cliente, DocCategoria, NF, OE, Prioridade } from "@/types";
import { REGISTO_TIPOS, TIPOS_EQUIPAMENTO } from "@/data/templates";
import { adicionarNF, anexarDocumento, criarOE, criarPedido } from "@/lib/actions";
import { nextNF, nextSubNF } from "@/lib/engine";
import { HOJE, matches, normalize } from "@/lib/format";
import { useStore } from "./store";
import { Button, Field, Modal, Note } from "./ui";

// ------------------------------------------------- Pesquisa de cliente SAGE

export function ClienteAutocomplete({ value, onPick }: { value: string; onPick: (c: Cliente) => void }) {
  const { state } = useStore();
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  // Aceita parte do nome, várias palavras em qualquer ordem, sem acentos, ou o n.º SAGE.
  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return state.clientes.slice(0, 8);
    return state.clientes
      .filter((c) => matches(q, c.nome, c.codigo, c.localidade))
      .sort((a, b) => Number(normalize(b.nome).startsWith(normalize(q))) - Number(normalize(a.nome).startsWith(normalize(q))) || a.nome.localeCompare(b.nome))
      .slice(0, 8);
  }, [query, state.clientes]);
  const pick = (c: Cliente) => {
    setQuery(c.nome);
    setOpen(false);
    onPick(c);
  };
  return (
    <div className="autocomplete">
      <div className="search">
        <Search size={15} />
        <input
          aria-label="Pesquisar cliente SAGE"
          value={query}
          placeholder="Nome ou n.º SAGE (ex.: atlantico conservas, 01134)"
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, results.length - 1));
            if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
            if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              pick(results[active]);
            }
          }}
        />
      </div>
      {open && (
        <div className="autocomplete-list" role="listbox">
          {results.length ? (
            results.map((c, i) => (
              <button type="button" key={c.codigo} className={i === active ? "active" : ""} onMouseDown={() => pick(c)}>
                <span>
                  <b>{c.nome}</b>
                  <small>{c.localidade}</small>
                </span>
                <span className="code">{c.codigo}</span>
              </button>
            ))
          ) : (
            <div className="empty" style={{ padding: 18 }}>
              Nenhum cliente encontrado na listagem SAGE.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Nova OE

export function NovaOEModal({ onClose }: { onClose: () => void }) {
  const { state, apply, user } = useStore();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ descricao: "", dataEntrega: "", encomendaCliente: "", orcamento: "", moradaInstalacao: "", responsavel: user, prioridade: "Normal" as Prioridade, observacoes: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const numero = state.sequencias.oe + 1;
  const valid = cliente && form.descricao.trim() && form.dataEntrega;
  const submit = () => {
    if (!cliente || !valid) return;
    const dados = {
      ...form,
      clienteCodigo: cliente.codigo,
      cliente: cliente.nome,
      moradaCliente: `${cliente.morada} · ${cliente.localidade}`,
      moradaInstalacao: form.moradaInstalacao || "Igual à morada do cliente",
    };
    apply((s) => criarOE(s, dados, user)[0], `OE ${numero} criada para ${cliente.nome}.`);
    onClose();
    router.push(`/oe/${numero}`);
  };
  return (
    <Modal title={`Nova Ordem de Execução · OE ${numero}`} subtitle="O número é atribuído automaticamente pela sequência global." onClose={onClose} wide>
      <div className="modal-body">
        <div className="form-section">Cliente</div>
        <Field label="Cliente (pesquisa na listagem SAGE)" hint="Ao escolher, o n.º SAGE e a morada são preenchidos automaticamente.">
          <ClienteAutocomplete value="" onPick={setCliente} />
        </Field>
        <div className="form-grid">
          <Field label="N.º SAGE">
            <input readOnly value={cliente?.codigo ?? ""} placeholder="Não indicado" />
          </Field>
          <Field label="Morada do cliente">
            <input readOnly value={cliente ? `${cliente.morada} · ${cliente.localidade}` : ""} placeholder="Não indicado" />
          </Field>
        </div>
        <div className="form-section">Encomenda</div>
        <Field label="Descrição">
          <input value={form.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Ex.: Caldeira Turbovap 1500 com quadro elétrico" />
        </Field>
        <div className="form-grid three">
          <Field label="Data de entrega">
            <input type="date" min={HOJE} value={form.dataEntrega} onChange={(e) => set("dataEntrega", e.target.value)} />
          </Field>
          <Field label="Encomenda do cliente">
            <input value={form.encomendaCliente} onChange={(e) => set("encomendaCliente", e.target.value)} />
          </Field>
          <Field label="Orçamento">
            <input value={form.orcamento} onChange={(e) => set("orcamento", e.target.value)} placeholder="ORC-26-…" />
          </Field>
          <Field label="Responsável">
            <select value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)}>
              {["Sérgio Carvalho", "Marta Lopes", "Ana Sousa"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioridade">
            <div className="choice-row">
              {(["Normal", "Urgente"] as Prioridade[]).map((p) => (
                <button type="button" key={p} className={form.prioridade === p ? "active" : ""} onClick={() => set("prioridade", p)}>
                  {p}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Morada de instalação">
            <input value={form.moradaInstalacao} onChange={(e) => set("moradaInstalacao", e.target.value)} placeholder="Igual à morada do cliente" />
          </Field>
        </div>
        <Field label="Observações">
          <textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
        </Field>
        <div className="form-actions">
          <Button secondary onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!valid} onClick={submit}>
            Criar OE {numero}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------- Adicionar equipamento

export function AdicionarNFModal({ oe, onClose, onCreated }: { oe: OE; onClose: () => void; onCreated?: (numero: string) => void }) {
  const { state, apply, user } = useStore();
  const principais = state.nfs.filter((n) => n.oe === oe.numero && !n.principal);
  const [registoTipo, setRegistoTipo] = useState<NF["registoTipo"]>("Equipamento novo");
  const [tipo, setTipo] = useState("Caldeira");
  const [designacao, setDesignacao] = useState("");
  const [principal, setPrincipal] = useState("");
  const proximo = principal ? nextSubNF(state, principal) : String(nextNF(state));
  const submit = () => {
    const dados = { oe: oe.numero, tipo, registoTipo, designacao: designacao || tipo, principal: principal || undefined };
    const [, numero] = adicionarNF(state, dados, user);
    apply((s) => adicionarNF(s, dados, user)[0], `NF ${numero} atribuído à OE ${oe.numero}.`);
    onClose();
    onCreated?.(numero);
  };
  return (
    <Modal title={`OE ${oe.numero} · adicionar equipamento / intervenção`} onClose={onClose}>
      <div className="modal-body">
        <Field label="Tipo de registo">
          <select value={registoTipo} onChange={(e) => setRegistoTipo(e.target.value as NF["registoTipo"])}>
            {REGISTO_TIPOS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Equipamento / componente">
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS_EQUIPAMENTO.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Designação / trabalho">
          <input value={designacao} onChange={(e) => setDesignacao(e.target.value)} placeholder={tipo} />
        </Field>
        <Field label="Numeração" hint="Os sub-NF (ex.: 1112/3) não consomem números da sequência global.">
          <select value={principal} onChange={(e) => setPrincipal(e.target.value)}>
            <option value="">Novo NF principal (sequência global)</option>
            {principais.map((n) => (
              <option key={n.numero} value={n.numero}>
                Sub-NF de NF {n.numero} · {n.designacao}
              </option>
            ))}
          </select>
        </Field>
        <Note tone="blue">
          Será atribuído o <b>NF {proximo}</b>. {principal ? "Os sub-NF não consomem números da sequência global." : "Um NF principal utilizado fica reservado e nunca volta a ser atribuído, mesmo que o registo seja anulado."}
        </Note>
        <div className="form-actions">
          <Button secondary onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit}>Criar registo</Button>
        </div>
      </div>
    </Modal>
  );
}

// ------------------------------------------------------- Pedido elétrico

export function NovoPedidoModal({ oe, onClose }: { oe: OE; onClose: () => void }) {
  const { state, apply, user } = useStore();
  const nfsOE = state.nfs.filter((n) => n.oe === oe.numero && n.estado !== "Anulado");
  const quadros = nfsOE.filter((n) => n.tipo === "Quadro elétrico");
  const [quadroNf, setQuadroNf] = useState(quadros[0]?.numero ?? "");
  const [nfs, setNfs] = useState<string[]>([]);
  const quadro = nfsOE.find((n) => n.numero === quadroNf);
  const tituloPara = (q?: NF) => (!q ? "" : q.designacao === q.tipo ? `Quadro elétrico NF ${q.numero} · OE ${oe.numero}` : `Quadro elétrico · ${q.designacao}`);
  const [titulo, setTitulo] = useState(tituloPara(quadro));
  const [hmi, setHmi] = useState<"Com HMI" | "Sem HMI" | "A definir">("A definir");
  const [requisitos, setRequisitos] = useState("");
  const submit = () => {
    apply((s) => criarPedido(s, { oe: oe.numero, titulo, quadroNf, nfs, hmi, alimentacao: quadro?.campos.el_alimentacao ?? "400 V · 3~ · 50 Hz", motores: quadro?.campos.el_motores ?? "", sondas: quadro?.campos.el_sondas ?? "", requisitos }, user)[0], "Pedido elétrico criado. Envie-o ao OIF quando estiver completo.");
    onClose();
  };
  return (
    <Modal title={`OE ${oe.numero} · novo pedido elétrico / automação`} subtitle="Folha de pedido para o OIF Elétrico" onClose={onClose}>
      <div className="modal-body">
        {!quadros.length && <Note tone="amber">Esta OE ainda não tem nenhum NF do tipo &quot;Quadro elétrico&quot;. Adicione primeiro o quadro em Equipamentos / Intervenções.</Note>}
        <Field label="NF do quadro elétrico">
          <select
            value={quadroNf}
            onChange={(e) => {
              setQuadroNf(e.target.value);
              setTitulo(tituloPara(nfsOE.find((n) => n.numero === e.target.value)));
            }}
          >
            {quadros.map((q) => (
              <option key={q.numero} value={q.numero}>
                NF {q.numero} · {q.designacao}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Título">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </Field>
        <Field label="Equipamentos comandados por este quadro">
          <div className="choice-row">
            {nfsOE
              .filter((n) => n.tipo !== "Quadro elétrico")
              .map((n) => (
                <button type="button" key={n.numero} className={nfs.includes(n.numero) ? "active" : ""} onClick={() => setNfs((x) => (x.includes(n.numero) ? x.filter((y) => y !== n.numero) : [...x, n.numero]))}>
                  NF {n.numero}
                </button>
              ))}
          </div>
        </Field>
        <Field label="Interface HMI">
          <div className="choice-row">
            {(["Com HMI", "Sem HMI", "A definir"] as const).map((h) => (
              <button type="button" key={h} className={hmi === h ? "active" : ""} onClick={() => setHmi(h)}>
                {h}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Requisitos funcionais">
          <textarea value={requisitos} onChange={(e) => setRequisitos(e.target.value)} placeholder="Ex.: comunicação Modbus TCP, alarme geral remoto…" />
        </Field>
        <div className="form-actions">
          <Button secondary onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!quadroNf || !titulo} onClick={submit}>
            Criar pedido
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ------------------------------------------------------------- Documentos

const CATEGORIAS: DocCategoria[] = ["Geral OE", "Desenhos", "Cálculos", "Certificados", "Manuais / fichas técnicas", "Elétrica / automação", "Inspeções / ensaios", "Documentação cliente"];

export function AnexarDocumentoModal({ oe, nf, onClose }: { oe: number; nf?: string; onClose: () => void }) {
  const { state, apply, user } = useStore();
  const [categoria, setCategoria] = useState<DocCategoria>(nf ? "Desenhos" : "Geral OE");
  const [descricao, setDescricao] = useState("");
  const [nfSel, setNfSel] = useState(nf ?? "");
  const [nome, setNome] = useState("");
  const submit = () => {
    apply((s) => anexarDocumento(s, { oe, nf: nfSel || undefined, categoria, descricao, nome: nome || `${descricao.replace(/\s+/g, "_")}.pdf`, paginas: 1 + Math.floor(Math.random() * 8) }, user), "Documento anexado (simulação · nenhum ficheiro foi enviado).");
    onClose();
  };
  return (
    <Modal title="Anexar documento" subtitle={`OE ${oe}${nfSel ? ` · NF ${nfSel}` : ""}`} onClose={onClose}>
      <div className="modal-body">
        <label className="upload-zone">
          <FileUp size={22} />
          <b>{nome || "Selecionar ficheiro"}</b>
          <small>Na demo o ficheiro não sai do computador: apenas o nome é registado.</small>
          <input type="file" onChange={(e) => setNome(e.target.files?.[0]?.name ?? "")} />
        </label>
        <Field label="Referente a / descrição" hint="Obrigatório, como na aplicação OE.">
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: Certificado de materiais da virola" />
        </Field>
        <div className="form-grid">
          <Field label="Categoria do dossier">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as DocCategoria)}>
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="NF associado">
            <select value={nfSel} onChange={(e) => setNfSel(e.target.value)}>
              <option value="">Documento geral da OE</option>
              {state.nfs
                .filter((n) => n.oe === oe)
                .map((n) => (
                  <option key={n.numero} value={n.numero}>
                    NF {n.numero}
                  </option>
                ))}
            </select>
          </Field>
        </div>
        <div className="form-actions">
          <Button secondary onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!descricao.trim()} onClick={submit}>
            Anexar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
