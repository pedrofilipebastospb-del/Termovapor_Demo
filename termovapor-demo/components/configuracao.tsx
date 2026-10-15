"use client";
import { Database, RotateCcw, ShieldCheck } from "lucide-react";
import { CONTAS } from "@/lib/access";
import { nextNF } from "@/lib/engine";
import { NF_ESTADOS, OE_ESTADOS, OIF_ESTADOS, StatusBadge } from "./status";
import { useStore } from "./store";
import { Badge, Button, DetailList, Note, PageHeader, Panel, Table } from "./ui";

const ACESSOS: [string, string, string, string][] = [
  ["Ordens de execução, NF e dossier", "Sim", "Sim", "Só a parte elétrica dos pedidos recebidos"],
  ["Clientes e moradas", "Sim", "Sim", "Não"],
  ["Pedidos elétricos", "Todos", "Os da OE", "Recebidos (sem rascunhos)"],
  ["OIF, quadros, artigos e stock", "Sim", "Não", "Sim"],
  ["Compras, receções e fornecedores", "Sim", "Não", "Sim"],
  ["Custos internos", "Sim", "Não", "Sim"],
  ["Configuração", "Sim", "Não", "Não"],
];

export function Configuracao() {
  const { state, reset, alterado, user, perfil } = useStore();
  return (
    <>
      <PageHeader eyebrow="Administração" title="Configuração" description="Perfis de acesso, sequências de numeração, estados e dados da plataforma." />
      <Panel title="Perfis de acesso" subtitle={`Sessão atual: ${user === perfil ? perfil : `${user} · ${perfil}`}`}>
        <Table
          rows={ACESSOS}
          rowKey={(r) => r[0]}
          columns={[
            { label: "Informação", render: (r) => <b>{r[0]}</b> },
            { label: CONTAS[0].perfil, render: (r) => r[1] },
            { label: CONTAS[1].perfil, render: (r) => r[2] },
            { label: CONTAS[2].perfil, render: (r) => r[3] },
          ]}
        />
      </Panel>
      <div className="grid-two">
        <Panel title="Contas">
          <div className="panel-body">
            <DetailList items={CONTAS.map((c) => [c.perfil, `${c.nome ? `${c.nome} · ` : ""}utilizador “${c.utilizador}”`] as [string, string])} />
            <Note tone="amber">Contas locais por perfil. Antes de uso operacional, passam a utilizadores individuais autenticados no servidor.</Note>
          </div>
        </Panel>
        <Panel title="Sequências" subtitle="Numeração global partilhada">
          <div className="panel-body">
            <DetailList
              items={[
                ["Última OE", `OE ${state.sequencias.oe}`],
                ["Próximo NF principal", `NF ${nextNF(state)}`],
                ["NF reservados (nunca reutilizados)", state.nfReservados.length],
                ["Última OIF", `OIF-2026-${String(state.sequencias.oif).padStart(3, "0")}`],
                ["Última encomenda", `ENC-2026-${String(state.sequencias.encomenda).padStart(3, "0")}`],
                ["Última receção", `RC-2026-${String(state.sequencias.rececao).padStart(3, "0")}`],
              ]}
            />
            <Note tone="blue">Os sub-NF (ex.: NF 1112/2) pertencem ao NF principal e não consomem números da sequência global.</Note>
          </div>
        </Panel>
      </div>
      <Panel title="Estados">
        <div className="panel-body">
          <DetailList
            items={[
              ["Ordens de execução", <span key="oe" className="title-row" style={{ justifyContent: "flex-end" }}>{OE_ESTADOS.map((e) => <StatusBadge key={e} estado={e} />)}</span>],
              ["Números de fabrico", <span key="nf" className="title-row" style={{ justifyContent: "flex-end" }}>{NF_ESTADOS.map((e) => <StatusBadge key={e} estado={e} />)}</span>],
              ["OIF", <span key="oif" className="title-row" style={{ justifyContent: "flex-end" }}>{OIF_ESTADOS.map((e) => <StatusBadge key={e} estado={e} />)}</span>],
            ]}
          />
        </div>
      </Panel>
      <div className="grid-two">
        <Panel title="Origem dos dados">
          <div className="panel-body">
            <Note tone="amber" icon={<Database size={15} />}>
              Dados reais importados das bases OE e OIF fornecidas. As alterações nesta aplicação ficam neste navegador e não alteram as bases originais.
            </Note>
            <DetailList
              items={[
                ["Base de dados OE (oe_v1.db)", <Badge key="1">Importada: {state.oes.length} OE · {state.nfs.length} NF</Badge>],
                ["Base de dados OIF (oif.db)", <Badge key="2">Importada: {state.oifs.length} OIF · {state.artigos.length} artigos</Badge>],
                ["Exportações SAGE", <Badge key="3">{state.clientes.length} clientes</Badge>],
                ["Alterações nesta sessão", alterado ? <Badge key="5" tone="blue">Guardadas neste navegador</Badge> : <Badge key="5" tone="green">Dados iniciais</Badge>],
              ]}
            />
          </div>
        </Panel>
        <Panel title="Repor dados iniciais">
          <div className="panel-body">
            <p className="muted" style={{ fontSize: 12, marginBottom: 16 }}>As alterações ficam apenas neste navegador. Reponha os dados para voltar ao estado inicial.</p>
            <div className="title-row">
              <Button onClick={reset} disabled={!alterado}>
                <RotateCcw size={14} /> Repor dados iniciais
              </Button>
              <span className="muted title-row" style={{ fontSize: 11 }}>
                <ShieldCheck size={14} /> Nenhum dado sai do computador
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
