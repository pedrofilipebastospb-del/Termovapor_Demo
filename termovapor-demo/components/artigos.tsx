"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Boxes, FileSpreadsheet, Lock, PackageX, Printer, SlidersHorizontal } from "lucide-react";
import type { Artigo } from "@/types";
import { ajustarStock, atualizarArtigo } from "@/lib/actions";
import { cobertura, livre, OIF_ATIVA, stockCritico } from "@/lib/engine";
import { date, matches, money, num, sum } from "@/lib/format";
import { useStore } from "./store";
import { Badge, Button, DetailList, Field, Metric, Modal, Note, PageHeader, SearchInput, Select, Table, type Column } from "./ui";

function StockBar({ a }: { a: Artigo }) {
  if (a.stockRegistado === false) return <span className="muted">Sem registo</span>;
  const max = Math.max(a.stock, a.minimo * 2, 1);
  const pct = livre(a) / max;
  return (
    <div className="stock-bar">
      <div className="progress">
        <span className={stockCritico(a) ? "red" : pct < 0.5 ? "amber" : "green"} style={{ width: `${Math.min(100, pct * 100)}%` }} />
      </div>
    </div>
  );
}

function ArtigoDrawer({ artigo, onClose }: { artigo: Artigo; onClose: () => void }) {
  const { state, apply, user, verCustos } = useStore();
  const [stock, setStock] = useState(artigo.stockRegistado === false ? "" : String(artigo.stock));
  const [motivo, setMotivo] = useState("");
  const [minimo, setMinimo] = useState(String(artigo.minimo));
  const movimentos = state.movimentos.filter((m) => m.artigoId === artigo.id);
  const usos = state.oifs
    .filter(OIF_ATIVA)
    .map((o) => ({ o, c: cobertura(state, o).find((c) => c.artigo.id === artigo.id) }))
    .filter((x) => x.c);
  return (
    <Modal drawer title={artigo.descricao} subtitle={`${artigo.codigo} · ${artigo.codigoInterno}`} onClose={onClose}>
      <div className="modal-body">
        <div className="metrics four" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <Metric label="Stock" value={artigo.stockRegistado === false ? "Sem registo" : num(artigo.stock, 2)} />
          <Metric label="Reservado" value={num(artigo.reservado, 2)} accent="accent" />
          <Metric label="Livre" value={artigo.stockRegistado === false ? "Por confirmar" : num(livre(artigo), 2)} accent={stockCritico(artigo) ? "danger" : "positive"} hint={`Mínimo ${artigo.minimo}`} />
        </div>
        <DetailList
          items={[
            ["Marca", artigo.marca],
            ["Referência do fabricante", <span className="mono" key="r">{artigo.referencia}</span>],
            ["Categoria", artigo.categoria],
            ["Unidade", artigo.unidade],
            ["Localização", artigo.localizacao],
            ...(verCustos ? ([["Custo interno unitário", money(artigo.custo)], ["Valor do stock", money(artigo.custo * artigo.stock)]] as [string, string][]) : []),
          ]}
        />
        <h3 style={{ margin: "20px 0 8px", fontSize: 12 }}>Necessidades em OIF ativas</h3>
        {usos.length ? (
          usos.map(({ o, c }) => (
            <div className="doc-row" key={o.numero}>
              <span>
                <Link className="accent" href={`/oif/${o.numero}`}>
                  <b>{o.numero}</b>
                </Link>
                <small>
                  Necessário {c!.necessario} · reservado {c!.reservado}
                </small>
              </span>
              {c!.artigo.stockRegistado === false ? <Badge tone="amber">Stock por confirmar</Badge> : c!.falta ? <Badge tone="red">Falta {c!.falta}</Badge> : <Badge tone="green">Coberto</Badge>}
            </div>
          ))
        ) : (
          <p className="muted" style={{ fontSize: 12 }}>
            Sem necessidades em OIF ativas.
          </p>
        )}
        <h3 style={{ margin: "20px 0 8px", fontSize: 12 }}>Ajustar stock / mínimo</h3>
        <div className="form-grid three">
          <Field label="Stock real">
            <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} />
          </Field>
          <Field label="Stock mínimo">
            <input type="number" min={0} value={minimo} onChange={(e) => setMinimo(e.target.value)} />
          </Field>
          <Field label="Motivo">
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Inventário…" />
          </Field>
        </div>
        <div className="form-actions" style={{ marginTop: 0 }}>
          <Button
            disabled={stock.trim() === "" || !Number.isFinite(Number(stock))}
            onClick={() => {
              apply((s) => {
                let next = ajustarStock(s, artigo.id, Math.max(0, Number(stock) || 0), motivo, user);
                if (Number(minimo) !== artigo.minimo) next = atualizarArtigo(next, artigo.id, { minimo: Math.max(0, Number(minimo) || 0) }, user, "Stock mínimo alterado");
                return next;
              }, `Artigo ${artigo.codigo} atualizado.`);
            }}
          >
            <SlidersHorizontal size={14} /> Guardar ajuste
          </Button>
        </div>
        <h3 style={{ margin: "20px 0 8px", fontSize: 12 }}>Movimentos ({movimentos.length})</h3>
        {movimentos.slice(0, 12).map((m) => (
          <div className="doc-row" key={m.id}>
            <span>
              <b>
                {m.tipo} · {num(m.quantidade, 2)} {artigo.unidade}
              </b>
              <small>
                {m.documento} · {date(m.data)} {m.observacoes && `· ${m.observacoes}`}
              </small>
            </span>
            <Badge tone={m.tipo === "Entrada" ? "green" : m.tipo === "Saída" ? "red" : m.tipo === "Reserva" ? "blue" : "neutral"}>{m.tipo}</Badge>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function ImportarSageModal({ onClose }: { onClose: () => void }) {
  return <Modal title="Dados SAGE" onClose={onClose}><div className="modal-body"><Note tone="blue">Os clientes e artigos iniciais foram importados das bases OE e OIF fornecidas. Para atualizar a cópia local, execute npm run import:real e recarregue a página.</Note><Button secondary onClick={onClose}>Fechar</Button></div></Modal>;
}

export function Artigos({ vistaInicial = "todos", pesquisa = "" }: { vistaInicial?: string; pesquisa?: string }) {
  const { state, verCustos, notify } = useStore();
  const [vista, setVista] = useState(vistaInicial);
  const [query, setQuery] = useState(pesquisa);
  const [categoria, setCategoria] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);
  const [importar, setImportar] = useState(false);
  const faltas = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of state.oifs.filter(OIF_ATIVA)) for (const c of cobertura(state, o)) if (c.falta) map.set(c.artigo.id, (map.get(c.artigo.id) ?? 0) + c.falta);
    return map;
  }, [state]);
  const categorias = [...new Set(state.artigos.map((a) => a.categoria))].sort();
  const rows = state.artigos
    .filter((a) => (vista === "criticos" ? stockCritico(a) : vista === "faltas" ? faltas.has(a.id) : true))
    .filter((a) => !categoria || a.categoria === categoria)
    .filter((a) => matches(query, a.codigo, a.codigoInterno, a.descricao, a.marca, a.referencia));
  const artigo = state.artigos.find((a) => a.id === aberto);

  const columns: Column<Artigo>[] = [
    { label: "Código", render: (a) => <span><b>{a.codigo}</b><small className="block">{a.codigoInterno}</small></span> },
    { label: "Descrição", render: (a) => <span><b>{a.descricao}</b><small className="block">{a.marca} · {a.referencia}</small></span> },
    { label: "Categoria", render: (a) => <span className="muted">{a.categoria}</span> },
    { label: "Stock", align: "right", render: (a) => a.stockRegistado === false ? "Sem registo" : num(a.stock, 2) },
    { label: "Reservado", align: "right", render: (a) => (a.reservado ? num(a.reservado, 2) : "Não indicado") },
    { label: "Livre", align: "right", render: (a) => a.stockRegistado === false ? "Por confirmar" : <b className={stockCritico(a) ? "danger" : ""}>{num(livre(a), 2)}</b> },
    { label: "Mínimo", align: "right", render: (a) => a.minimo },
    { label: "Nível", render: (a) => <StockBar a={a} /> },
    { label: "Falta OIF", align: "right", render: (a) => (faltas.get(a.id) ? <Badge tone="red">{faltas.get(a.id)}</Badge> : "Não indicado") },
    { label: "Local.", render: (a) => <span className="mono">{a.localizacao}</span> },
  ];
  if (verCustos) columns.push({ label: "Custo unit.", align: "right", render: (a) => money(a.custo) });

  return (
    <>
      <PageHeader
        eyebrow="OIF · Materiais"
        title="Artigos e stock"
        description="Cadastro de material elétrico com stock físico, reservas para OIF e stock livre. O stock livre é o que pode ser reservado para novas OIF."
        actions={
          <>
            <Button secondary onClick={() => notify("Lista operacional de artigos enviada para impressão (simulação · sem preços).")}>
              <Printer size={15} /> Imprimir lista
            </Button>
            <Button onClick={() => setImportar(true)}>
              <FileSpreadsheet size={15} /> Importar Excel do SAGE
            </Button>
          </>
        }
      />
      <div className="metrics four">
        <Metric label="Artigos cadastrados" value={state.artigos.length} icon={<Boxes size={16} />} onClick={() => setVista("todos")} />
        <Metric label="Abaixo do mínimo (livre)" value={state.artigos.filter(stockCritico).length} accent="amber" icon={<AlertTriangle size={16} />} onClick={() => setVista("criticos")} />
        <Metric label="Com falta real em OIF" value={faltas.size} accent={faltas.size ? "danger" : "positive"} icon={<PackageX size={16} />} onClick={() => setVista("faltas")} />
        {verCustos ? (
          <Metric label="Valor interno do stock" value={money(sum(state.artigos, (a) => a.stock * a.custo))} hint="Uso exclusivamente interno" />
        ) : (
          <Metric label="Valor interno do stock" value={<Lock size={20} className="muted" />} hint="Reservado à direção e eletricidade" />
        )}
      </div>
          <div className="filter-bar">
            <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar por código, descrição, marca ou referência…" />
            <div className="segmented" role="group" aria-label="Vista">
              {[
                ["todos", "Todos"],
                ["criticos", "Abaixo do mínimo"],
                ["faltas", "Falta em OIF"],
              ].map(([id, label]) => (
                <button type="button" key={id} className={vista === id ? "active" : ""} onClick={() => setVista(id)}>
                  {label}
                </button>
              ))}
            </div>
            <Select label="Categoria" value={categoria} onChange={setCategoria} options={categorias} placeholder="Todas as categorias" />
            <span className="filter-total">{rows.length} artigos</span>
          </div>
          <Table rows={rows} rowKey={(a) => a.id} pageSize={15} onRow={(a) => setAberto(a.id)} rowClass={(a) => (faltas.has(a.id) ? "row-warning" : "")} columns={columns} />
      {artigo && <ArtigoDrawer artigo={artigo} onClose={() => setAberto(null)} />}
      {importar && <ImportarSageModal onClose={() => setImportar(false)} />}
    </>
  );
}

export function Movimentos() {
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("");
  const rows = state.movimentos
    .filter((m) => !tipo || m.tipo === tipo)
    .filter((m) => {
      const a = state.artigos.find((x) => x.id === m.artigoId);
      return matches(query, a?.codigo, a?.descricao, m.documento, m.observacoes);
    });
  return (
    <>
      <PageHeader eyebrow="OIF · Materiais" title="Movimentos de stock" description="Entradas, saídas, reservas, libertações e ajustes, com o documento de origem." />
      <div className="filter-bar">
        <SearchInput value={query} onChange={setQuery} placeholder="Pesquisar artigo, documento ou observação…" />
        <Select label="Tipo" value={tipo} onChange={setTipo} options={["Entrada", "Saída", "Reserva", "Libertação", "Ajuste"]} placeholder="Todos os tipos" />
        <span className="filter-total">{rows.length} movimentos</span>
      </div>
      <Table
        rows={rows}
        rowKey={(m) => m.id}
        pageSize={15}
        columns={[
          { label: "Data", render: (m) => date(m.data) },
          { label: "Tipo", render: (m) => <Badge tone={m.tipo === "Entrada" ? "green" : m.tipo === "Saída" ? "red" : m.tipo === "Reserva" ? "blue" : "neutral"}>{m.tipo}</Badge> },
          { label: "Artigo", render: (m) => { const a = state.artigos.find((x) => x.id === m.artigoId); return <span><b>{a?.codigo}</b><small className="block">{a?.descricao}</small></span>; } },
          { label: "Quantidade", align: "right", render: (m) => num(m.quantidade, 2) },
          { label: "Documento", render: (m) => (m.documento.startsWith("OIF") ? <Link className="accent" href={`/oif/${m.documento}`}>{m.documento}</Link> : m.documento) },
          { label: "Observações", render: (m) => <span className="muted">{m.observacoes || "Não indicado"}</span> },
        ]}
      />
    </>
  );
}
