import type { Metadata } from "next";
import { Pedidos } from "@/components/pedidos";

export const metadata: Metadata = { title: "Pedidos elétricos" };

export default async function Page({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  return <Pedidos key={p ?? "todos"} abrir={p} />;
}
