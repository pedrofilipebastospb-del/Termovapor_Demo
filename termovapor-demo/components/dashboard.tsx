"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, CalendarDays, ClipboardList, Clock3, PackageX, Plus, Send, Zap } from "lucide-react";
import type { Perfil, State } from "@/types";
import { ADMIN, ELE, ENG, oeHref } from "@/lib/access";
import { cobertura, linhasSemArtigo, OIF_ATIVA } from "@/lib/engine";
import { date, daysUntil, HOJE } from "@/lib/format";
import { OE_ESTADOS, OIF_ESTADOS, StatusBadge } from "./status";
import { useStore } from "./store";
import { Button, Metric, PageHeader, Panel } from "./ui";

const OE_ATIVA = (estado: string) => !["Concluída", "Fechada", "Anulada"].includes(estado);

type Item = {
  key: string;
  tipo: "OE" | "OIF" | "Quadro" | "Pedido";
  ref: string;
  titulo: string;
  motivos: string[];
  estado: string;
  data?: string;
  href: string;
  peso: number;
  atraso: boolean;
  material: boolean;
};

// Fila de atenção: o mesmo registo aparece uma vez, com todas as razões.
// Ordem: atrasos, bloqueios de material, referências a rever, prioridades.
function filaAtencao(state: State, perfil: Perfil, verComercial: boolean): Item[] {
  const out: Item[] = [];
  const dias = (iso: string) => Math.abs(daysUntil(iso));
  if (perfil !== ELE) {
    for (const o of state.oes.filter((x) => OE_ATIVA(x.estado))) {
      const motivos: string[] = [];
      const atraso = o.estado !== "Suspensa" && daysUntil(o.dataEntrega) < 0;
      if (atraso) motivos.push(`Entrega ultrapassada há ${dias(o.dataEntrega)} dias`);
      if (o.estado === "Aguarda material") motivos.push("Aguarda material");
      if (o.estado === "Suspensa") motivos.push("Ordem suspensa");
      if (o.prioridade === "Urgente") motivos.push("Prioridade urgente");
      if (motivos.length)
        out.push({ key: `oe-${o.numero}`, tipo: "OE", ref: `OE ${o.numero}`, titulo: verComercial ? o.cliente : o.descricao, motivos, estado: o.estado, data: o.dataEntrega, href: oeHref(perfil, o.numero), peso: atraso ? 0 : o.estado === "Aguarda material" ? 1 : o.prioridade === "Urgente" ? 3 : 4, atraso, material: o.estado === "Aguarda material" });
    }
    for (const p of state.pedidos.filter((x) => x.estado === "Não enviado"))
      out.push({ key: `p-${p.codigo}`, tipo: "Pedido", ref: p.codigo, titulo: p.titulo, motivos: ["Por enviar ao OIF"], estado: "Não enviada", href: `/pedidos?p=${p.codigo}`, peso: 2, atraso: false, material: false });
  }
  if (perfil !== ENG) {
    for (const o of state.oifs.filter(OIF_ATIVA)) {
      const motivos: string[] = [];
      const atraso = daysUntil(o.prazo) < 0;
      const faltas = cobertura(state, o).filter((c) => c.falta > 0).length;
      if (atraso) motivos.push(`Prazo ultrapassado há ${dias(o.prazo)} dias`);
      else if (daysUntil(o.prazo) <= 3) motivos.push(`Prazo em ${daysUntil(o.prazo)} dias`);
      if (o.estado === "Aguarda material") motivos.push("Aguarda material");
      if (faltas) motivos.push(`${faltas} ${faltas === 1 ? "artigo com falta real" : "artigos com falta real"}`);
      if (!o.responsavel) motivos.push("Sem responsável atribuído");
      if (!o.importada && o.etapas.length <= 2) motivos.push("Pedido novo por tratar");
      if (motivos.length) {
        const q = state.quadros.find((x) => x.id === o.quadroId);
        out.push({ key: `oif-${o.numero}`, tipo: "OIF", ref: o.numero, titulo: q?.descricao ?? "", motivos, estado: o.estado, data: o.prazo, href: `/oif/${o.numero}`, peso: atraso ? 0 : faltas || o.estado === "Aguarda material" ? 1 : 2, atraso, material: o.estado === "Aguarda material" || faltas > 0 });
      }
    }
    for (const q of state.quadros) {
      const sem = linhasSemArtigo(q).length;
      const oif = state.oifs.find((o) => o.quadroId === q.id);
      if (!oif || !OIF_ATIVA(oif)) continue;
      const motivos: string[] = [];
      if (sem) motivos.push(`${sem} ${sem === 1 ? "linha SEE por rever" : "linhas SEE por rever"}`);
      if (q.pdf && !q.linhas.length) motivos.push("Lista de materiais por extrair do PDF");
      if (motivos.length) out.push({ key: `q-${q.id}`, tipo: "Quadro", ref: q.codigo, titulo: q.descricao, motivos, estado: "Por rever", data: oif.prazo, href: `/quadros?q=${q.id}`, peso: 2, atraso: false, material: false });
    }
  }
  return out.sort((a, b) => a.peso - b.peso || (a.data ?? "9").localeCompare(b.data ?? "9"));
}

export function Dashboard() {
  const { state, user, perfil, verComercial } = useStore();
  const router = useRouter();
  const [filtro, setFiltro] = useState<"todas" | "atraso" | "material">("todas");
  const fila = useMemo(() => filaAtencao(state, perfil, verComercial), [state, perfil, verComercial]);
  const visiveis = fila.filter((i) => (filtro === "atraso" ? i.atraso : filtro === "material" ? i.material : true));

  const oesAtivas = state.oes.filter((o) => OE_ATIVA(o.estado));
  const oifAtivas = state.oifs.filter(OIF_ATIVA);
  const atrasos = fila.filter((i) => i.atraso).length;
  const aguardam = (perfil !== ELE ? oesAtivas.filter((o) => o.estado === "Aguarda material").length : 0) + (perfil !== ENG ? oifAtivas.filter((o) => o.estado === "Aguarda material").length : 0);
  const faltas = oifAtivas.reduce((n, o) => n + cobertura(state, o).filter((c) => c.falta > 0).length, 0);

  const prazos = [
    ...(perfil !== ELE ? oesAtivas.filter((o) => o.estado !== "Suspensa").map((o) => ({ ref: `OE ${o.numero}`, sub: verComercial ? o.cliente : o.descricao, data: o.dataEntrega, href: oeHref(perfil, o.numero) })) : []),
    ...(perfil !== ENG ? oifAtivas.map((o) => ({ ref: o.numero, sub: state.quadros.find((q) => q.id === o.quadroId)?.descricao ?? "", data: o.prazo, href: `/oif/${o.numero}` })) : []),
  ]
    .filter((p) => p.data >= HOJE)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 6);

  const subtitulo = perfil === ADMIN ? "Estado da operação, prioridades e bloqueios." : perfil === ENG ? "Ordens, equipamentos e pedidos elétricos da engenharia." : "Pedidos recebidos, fabrico e bloqueios de material.";

  return (
    <>
      <PageHeader
        eyebrow={`Terça-feira, 14 de outubro de 2026 · ${user}`}
        title="Visão geral"
        description={subtitulo}
        actions={
          perfil !== ELE ? (
            <Button onClick={() => router.push("/oe?nova=1")}>
              <Plus size={15} /> Nova OE
            </Button>
          ) : (
            <Button onClick={() => router.push("/oif")}>
              <Zap size={15} /> Abrir fabrico
            </Button>
          )
        }
      />

      <div className="metrics four">
        {perfil !== ELE && <Metric label="OE em curso" value={oesAtivas.length} hint={`${oesAtivas.filter((o) => o.prioridade === "Urgente").length} urgentes`} icon={<ClipboardList size={16} />} onClick={() => router.push("/oe")} />}
        {perfil === ENG && <Metric label="Pedidos por enviar" value={state.pedidos.filter((p) => p.estado === "Não enviado").length} hint="Folhas elétricas em preparação" icon={<Send size={16} />} accent="amber" onClick={() => router.push("/pedidos")} />}
        {perfil !== ENG && <Metric label="OIF pendentes" value={oifAtivas.length} hint="Fabrico por concluir" icon={<Zap size={16} />} accent="accent" onClick={() => router.push("/oif")} />}
        <Metric label="Prazos ultrapassados" value={atrasos} hint="Trabalhos ativos à data de hoje" icon={<Clock3 size={16} />} accent={atrasos ? "danger" : "positive"} onClick={() => setFiltro("atraso")} />
        <Metric label="Aguardam material" value={aguardam} hint="Estado registado na OE ou na OIF" icon={<AlertTriangle size={16} />} accent={aguardam ? "amber" : undefined} onClick={() => setFiltro("material")} />
        {perfil === ELE && <Metric label="Faltas reais de material" value={faltas} hint="Depois de reservas e stock livre" icon={<PackageX size={16} />} accent={faltas ? "danger" : "positive"} onClick={() => router.push("/artigos?vista=faltas")} />}
      </div>

      <div className="overview-work">
        <section>
          <div className="section-top">
            <div>
              <h2>Trabalhos que precisam de atenção</h2>
              <p>Atrasos e bloqueios primeiro; depois referências a rever e prioridades.</p>
            </div>
          </div>
          <div className="segmented" role="group" aria-label="Filtro" style={{ marginBottom: 12 }}>
            {(
              [
                ["todas", "Todas as prioridades"],
                ["atraso", "Prazos ultrapassados"],
                ["material", "Aguardam material"],
              ] as const
            ).map(([id, label]) => (
              <button type="button" key={id} className={filtro === id ? "active" : ""} onClick={() => setFiltro(id)}>
                {label}
              </button>
            ))}
          </div>
          <div className="attention-list">
            {visiveis.map((i) => (
              <Link key={i.key} href={i.href} className="attention-item">
                <span className={`attention-icon ${i.atraso ? "red" : i.material ? "amber" : ""}`}>
                  <AlertTriangle size={15} />
                </span>
                <span className="attention-main">
                  <span className="title-row">
                    <span className="tag">{i.tipo}</span>
                    <b className="mono">{i.ref}</b>
                  </span>
                  <span className="attention-title">{i.titulo}</span>
                  <span className="attention-reasons">
                    {i.motivos.map((m) => (
                      <span key={m} className={/ultrapassad/.test(m) ? "danger" : /material|falta/.test(m) ? "amber-text" : ""}>
                        {m}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="attention-meta">
                  <StatusBadge estado={i.estado} />
                  {i.data && <small className={i.atraso ? "danger" : ""}>{date(i.data)}</small>}
                  <ArrowRight size={15} />
                </span>
              </Link>
            ))}
            {!visiveis.length && <div className="empty">Nada a assinalar neste filtro.</div>}
          </div>
        </section>

      </div>

      <div className="overview-summaries">
        <Panel className="overview-card overview-deadlines" title="Próximos prazos" subtitle="Entregas previstas dos trabalhos ativos" actions={<CalendarDays size={16} className="muted" />}>
          <div className="deadline-list">
            {prazos.map((p) => (
              <Link key={p.ref} href={p.href}>
                <time dateTime={p.data} className="deadline-date"><b>{p.data.slice(8, 10)}</b><span>{new Intl.DateTimeFormat("pt-PT", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${p.data}T12:00:00Z`))}</span></time>
                <span className="deadline-work"><b className="mono">{p.ref}</b><small>{p.sub}</small></span>
                <ArrowRight size={14} aria-hidden />
              </Link>
            ))}
            {!prazos.length && <p className="summary-empty">Sem prazos futuros.</p>}
          </div>
        </Panel>
        <Panel className="overview-card overview-states" title="Trabalhos por estado" subtitle="Inclui trabalhos concluídos">
          <div className="summary-state-groups">
            {[
              ...(perfil !== ELE ? [{ key: "OE", label: "Engenharia", rows: OE_ESTADOS.map((e) => ({ e, n: state.oes.filter((o) => o.estado === e).length })) }] : []),
              ...(perfil !== ENG ? [{ key: "OIF", label: "Fabrico elétrico", rows: OIF_ESTADOS.map((e) => ({ e, n: state.oifs.filter((o) => o.estado === e).length })) }] : []),
            ].map((group) => (
              <section key={group.key} aria-label={`Estados ${group.key}`}>
                <header><b>{group.key}</b><span>{group.label}</span></header>
                {group.rows.filter((x) => x.n).map((x) => <div className="summary-state-row" key={x.e}><span>{x.e}</span><b>{x.n}</b></div>)}
                {!group.rows.some((x) => x.n) && <p className="summary-empty">Sem trabalhos.</p>}
              </section>
            ))}
          </div>
        </Panel>
        <Panel className="overview-card overview-electrical" title="Acompanhamento elétrico" subtitle="Pedidos, materiais e compras">
          <div className="electrical-summary-list">
            {[
              ...(perfil !== ELE ? [{ href: "/pedidos", count: state.pedidos.filter((p) => p.estado === "Não enviado").length, title: "Por enviar ao OIF", description: "Folhas em preparação na OE" }] : []),
              { href: "/pedidos", count: state.pedidos.filter((p) => p.estado !== "Não enviado" && p.estado !== "Devolvido à OE").length, title: "Pedidos por devolver", description: "Aguardam definição final do OIF" },
              ...(perfil !== ENG ? [
                { href: "/quadros", count: state.quadros.reduce((n, q) => n + linhasSemArtigo(q).length, 0), title: "Linhas SEE por rever", description: "Materiais sem artigo associado" },
                { href: "/encomendas", count: state.encomendas.filter((e) => !["Recebida", "Cancelada"].includes(e.estado)).length, title: "Encomendas em aberto", description: "Material por receber" },
              ] : []),
            ].map((item) => (
              <Link key={item.title} href={item.href}><b className={`summary-number ${item.count ? "has-items" : ""}`}>{item.count}</b><span><b>{item.title}</b><small>{item.description}</small></span><ArrowRight size={14} aria-hidden /></Link>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
