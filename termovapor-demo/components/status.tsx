"use client";
// Identificação visual dos estados, seguindo as cores suaves usadas na OE
// (amarelo = preparação, azul = execução, laranja = aguarda, verde = concluído).
import { Check } from "lucide-react";
import type { EncomendaEstado, NFEstado, OEEstado, OIF, OIFEstado, PedidoEstado } from "@/types";
import { ETAPAS } from "@/data/eletrico";
import { date } from "@/lib/format";
import { Badge, type Tone } from "./ui";

export const OE_ESTADOS: OEEstado[] = ["Nova", "Em preparação", "Em execução", "Aguarda material", "Suspensa", "Concluída", "Fechada", "Anulada"];
export const NF_ESTADOS: NFEstado[] = ["Definição", "Em preparação", "Em fabrico", "Aguarda material", "Concluído", "Anulado"];
export const OIF_ESTADOS: OIFEstado[] = ["Aberta", "Aguarda material", "Material reservado", "Em montagem", "Em teste", "Concluída", "Cancelada"];

const TONES: Record<string, Tone> = {
  Nova: "amber",
  "Em preparação": "amber",
  Definição: "amber",
  "Em execução": "blue",
  "Em fabrico": "blue",
  "Em montagem": "blue",
  "Em teste": "blue",
  "Material reservado": "blue",
  Aberta: "amber",
  "Aguarda material": "accent",
  Suspensa: "neutral",
  Concluída: "green",
  Concluído: "green",
  Fechada: "green",
  Anulada: "red",
  Anulado: "red",
  Cancelada: "red",
  "Não enviado": "neutral",
  "Não enviada": "neutral",
  "Recebida do OIF": "green",
  "Em elaboração": "blue",
  "Devolvida à OE": "green",
  "Por rever": "amber",
  "Enviado ao OIF": "amber",
  "Devolvido à OE": "green",
  Rascunho: "neutral",
  Enviada: "amber",
  Confirmada: "blue",
  "Recebida parcial": "accent",
  Recebida: "green",
  Urgente: "red",
  Normal: "neutral",
};

export function StatusBadge({ estado }: { estado: OEEstado | NFEstado | OIFEstado | PedidoEstado | EncomendaEstado | string }) {
  return (
    <Badge tone={TONES[estado] ?? "neutral"}>
      <i className="badge-dot" />
      {estado}
    </Badge>
  );
}

export function PrioridadeBadge({ prioridade }: { prioridade: string }) {
  return prioridade === "Urgente" ? <Badge tone="red">Urgente</Badge> : <span className="muted">Normal</span>;
}

// Linha de tempo da OIF: da receção do pedido à devolução à OE.
export function FlowStepper({ oif, compact = false }: { oif: OIF; compact?: boolean }) {
  return (
    <ol className={`flow ${compact ? "compact" : ""}`}>
      {ETAPAS.map((nome, i) => {
        const feito = oif.etapas[i];
        const atual = !feito && i === oif.etapas.length && oif.estado !== "Cancelada";
        return (
          <li key={nome} className={feito ? "done" : atual ? "current" : ""}>
            <span className="flow-dot">{feito ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
            <div>
              <b>{nome}</b>
              {!compact && <small>{feito ? `${date(feito.data)} · ${feito.utilizador}` : atual ? "Etapa atual" : "Pendente"}</small>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
