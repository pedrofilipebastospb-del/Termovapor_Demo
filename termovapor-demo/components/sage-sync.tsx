"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useStore } from "./store";
import { Button } from "./ui";

// Sincronização com o SAGE (simulada: não há ligação real ao ERP).
export function SincronizarSage({ alvo, total }: { alvo: "artigos" | "clientes"; total: number }) {
  const { notify } = useStore();
  const [aSincronizar, setASincronizar] = useState(false);
  const [ultima, setUltima] = useState<string | null>(null);
  const sincronizar = () => {
    setASincronizar(true);
    setTimeout(() => {
      const agora = new Date();
      setUltima(`${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`);
      setASincronizar(false);
      notify(alvo === "artigos" ? `Sincronização com o SAGE concluída: ${total} artigos verificados (stock real e último preço de compra).` : `Sincronização com o SAGE concluída: ${total} clientes verificados.`);
    }, 1400);
  };
  return (
    <span className="sage-sync">
      {ultima && <small>Última sincronização: hoje, {ultima}</small>}
      <Button secondary onClick={sincronizar} disabled={aSincronizar}>
        <RefreshCw size={15} className={aSincronizar ? "spin" : ""} /> {aSincronizar ? "A sincronizar…" : "Sincronizar com SAGE"}
      </Button>
    </span>
  );
}
