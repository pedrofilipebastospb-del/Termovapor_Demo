"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronRight, ClipboardList, Contact, FileSearch, History, LayoutDashboard, LogOut, Package, Search, Settings2, ShieldAlert, Zap } from "lucide-react";
import { AREAS, areaDe, ELE, oeHref, podeAceder, UTILITARIOS } from "@/lib/access";
import { OIF_ATIVA } from "@/lib/engine";
import { initials, matches } from "@/lib/format";
import { Login } from "./login";
import { useStore } from "./store";
import { Modal } from "./ui";

const ICONES: Record<string, typeof LayoutDashboard> = {
  geral: LayoutDashboard,
  oe: ClipboardList,
  eletricidade: Zap,
  materiais: Package,
  clientes: Contact,
};
const ICONES_UTIL: Record<string, typeof LayoutDashboard> = { "/documentos": FileSearch, "/historico": History, "/configuracao": Settings2 };

const matchPrefix = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "compact" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/termovapor-logo.png" alt="Termovapor · Indústria de Caldeiras, S.A." />
    </div>
  );
}

function PesquisaGlobal({ onClose }: { onClose: () => void }) {
  const { state, perfil, verComercial } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const resultados = useMemo(() => {
    if (!q.trim()) return [];
    const out: { tipo: string; titulo: string; sub: string; href: string }[] = [];
    for (const o of state.oes)
      if (podeAceder(perfil, oeHref(perfil, o.numero)) && matches(q, `OE ${o.numero}`, o.numero, verComercial ? o.cliente : "", o.descricao))
        out.push({ tipo: "OE", titulo: `OE ${o.numero}`, sub: verComercial ? o.cliente : o.descricao, href: oeHref(perfil, o.numero) });
    for (const n of state.nfs)
      if (matches(q, `NF ${n.numero}`, n.numero, n.designacao))
        out.push({ tipo: "NF", titulo: `NF ${n.numero}`, sub: `${n.designacao} · OE ${n.oe}`, href: perfil === ELE ? `/origem/oe/${n.oe}` : `/oe/${n.oe}?tab=nf` });
    for (const p of state.pedidos)
      if (matches(q, p.codigo, p.titulo, `NF ${p.quadroNf}`)) out.push({ tipo: "Pedido", titulo: p.codigo, sub: p.titulo, href: `/pedidos?p=${p.codigo}` });
    if (podeAceder(perfil, "/oif"))
      for (const o of state.oifs)
        if (matches(q, o.numero, `NF ${o.nf}`, `OE ${o.oe}`)) out.push({ tipo: "OIF", titulo: o.numero, sub: `OE ${o.oe} · NF ${o.nf} · ${o.estado}`, href: `/oif/${o.numero}` });
    if (podeAceder(perfil, "/quadros"))
      for (const qd of state.quadros) if (matches(q, qd.codigo, qd.descricao)) out.push({ tipo: "Quadro", titulo: qd.codigo, sub: qd.descricao, href: `/quadros?q=${qd.id}` });
    if (podeAceder(perfil, "/artigos"))
      for (const a of state.artigos) if (matches(q, a.codigo, a.descricao, a.referencia)) out.push({ tipo: "Artigo", titulo: a.codigo, sub: a.descricao, href: `/artigos?pesquisa=${encodeURIComponent(a.codigo)}` });
    if (podeAceder(perfil, "/clientes"))
      for (const c of state.clientes) if (matches(q, c.nome, c.codigo)) out.push({ tipo: "Cliente", titulo: c.nome, sub: `N.º Sage ${c.codigo}`, href: `/clientes?pesquisa=${encodeURIComponent(c.codigo)}` });
    return out.slice(0, 24);
  }, [q, state, perfil, verComercial]);
  return (
    <Modal title="Pesquisar na plataforma" onClose={onClose}>
      <div className="modal-body">
        <div className="search" style={{ minHeight: 46 }}>
          <Search size={17} />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input autoFocus aria-label="Pesquisa global" placeholder="OE, NF, pedido, OIF, quadro ou artigo…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="search-results">
          {resultados.map((r) => (
            <button
              type="button"
              key={`${r.tipo}-${r.titulo}`}
              onClick={() => {
                onClose();
                router.push(r.href);
              }}
            >
              <span className="tag">{r.tipo}</span>
              <span>
                <b>{r.titulo}</b>
                <small>{r.sub}</small>
              </span>
              <ArrowUpRight size={15} />
            </button>
          ))}
          {q && !resultados.length && <p className="muted" style={{ fontSize: 12, padding: "14px 2px" }}>Sem resultados no âmbito do seu perfil.</p>}
          {!q && <p className="muted" style={{ fontSize: 12, padding: "14px 2px" }}>Comece a escrever para procurar nas áreas do seu perfil.</p>}
        </div>
      </div>
    </Modal>
  );
}

function SemAcesso() {
  return (
    <div className="restricted" style={{ minHeight: "50vh", justifyContent: "center" }}>
      <ShieldAlert size={26} />
      <b>Área fora do seu perfil</b>
      <span>Esta página não está disponível para o perfil com que entrou.</span>
      <Link className="button secondary" href="/">
        Voltar à visão geral
      </Link>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  const router = useRouter();
  const { state, ready, sessao, perfil, user, funcao, sair } = useStore();
  const [pesquisa, setPesquisa] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPesquisa((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!sessao && path !== "/entrar") router.replace("/entrar");
    if (sessao && path === "/entrar") router.replace("/");
  }, [ready, sessao, path, router]);

  if (!ready) return <div className="loading" role="status">A carregar…</div>;
  if (!sessao || path === "/entrar") return <Login />;

  const area = areaDe(path);
  const seccoes = area?.seccoes.filter((s) => s.perfis.includes(perfil)) ?? [];
  const seccao = [...seccoes].sort((a, b) => b.href.length - a.href.length).find((s) => matchPrefix(path, s.href));
  const util = UTILITARIOS.find((u) => matchPrefix(path, u.href));
  const counts: Record<string, number> = {
    oe: perfil === ELE ? 0 : state.oes.filter((o) => !["Concluída", "Fechada", "Anulada"].includes(o.estado)).length,
    eletricidade: perfil === ELE ? state.oifs.filter(OIF_ATIVA).length : state.pedidos.filter((p) => p.estado === "Não enviado").length,
  };
  const ultimo = decodeURIComponent(path.split("/").pop() ?? "");
  const detalhe = seccao && path !== seccao.href ? (matchPrefix(path, "/oe") || matchPrefix(path, "/origem") ? `OE ${ultimo}` : ultimo) : null;
  const perfilLabel = perfil === "Administração" ? "Administração" : perfil;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand-link" aria-label="Ir para a visão geral">
          <Brand />
        </Link>
        <div className="workspace-label">{perfilLabel.toUpperCase()}</div>
        <nav>
          {AREAS.filter((a) => a.perfis.includes(perfil)).map((a) => {
            const Icon = ICONES[a.key];
            const ativo = area?.key === a.key && !util;
            const destino = a.seccoes.find((s) => s.perfis.includes(perfil))?.href ?? a.href;
            return (
              <Link key={a.key} href={destino} className={`nav-area ${ativo ? "active" : ""}`}>
                <Icon size={17} />
                <span>{a.label}</span>
                {counts[a.key] > 0 && <span className="nav-count">{counts[a.key]}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-utils">
            <button type="button" onClick={() => setPesquisa(true)}>
              <Search size={15} /> <span>Pesquisar</span> <kbd>Ctrl K</kbd>
            </button>
            {UTILITARIOS.filter((u) => u.perfis.includes(perfil)).map((u) => {
              const Icon = ICONES_UTIL[u.href];
              return (
                <Link key={u.href} href={u.href} className={util?.href === u.href ? "active" : ""}>
                  <Icon size={15} /> <span>{u.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="session-box">
            <div className="avatar">{initials(user)}</div>
            <div>
              <b>{user}</b>
              <small>{funcao}</small>
            </div>
            <button
              type="button"
              className="icon-button"
              title="Terminar sessão"
              aria-label="Terminar sessão"
              onClick={() => {
                sair();
                router.replace("/entrar");
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
          <div className="agency">
            <span>Desenvolvido por</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vougalogo.png" alt="Vouga Agency" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Termovapor</span>
            <ChevronRight size={14} />
            {util ? (
              <b>{util.label}</b>
            ) : (
              <>
                {area && area.key !== "geral" && seccao && seccoes.length > 1 && (
                  <>
                    <span>{area.label}</span>
                    <ChevronRight size={14} />
                  </>
                )}
                {detalhe && seccao ? (
                  <>
                    <Link href={seccao.href}>{seccao.label}</Link>
                    <ChevronRight size={14} />
                    <b>{detalhe}</b>
                  </>
                ) : (
                  <b>{seccao?.label ?? area?.label ?? "Página"}</b>
                )}
              </>
            )}
          </div>
          <div className="topbar-right">
            <button type="button" className="global-search" onClick={() => setPesquisa(true)}>
              <Search size={15} /> <span>Pesquisar na plataforma</span> <kbd>Ctrl K</kbd>
            </button>
            <span className="session-tag">{perfilLabel.toUpperCase()}</span>
          </div>
        </header>
        <main>
          {seccoes.length > 1 && !util && seccoes.some((s) => s.href === path) && (
            <nav className="area-tabs" aria-label={area?.label}>
              {seccoes.map((s) => (
                <Link key={s.href} href={s.href} className={seccao?.href === s.href ? "active" : ""}>
                  {s.label}
                </Link>
              ))}
            </nav>
          )}
          {podeAceder(perfil, path) ? children : <SemAcesso />}
        </main>
      </div>
      {pesquisa && <PesquisaGlobal onClose={() => setPesquisa(false)} />}
    </div>
  );
}
