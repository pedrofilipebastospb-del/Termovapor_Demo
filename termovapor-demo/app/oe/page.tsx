import type { Metadata } from "next";
import { OEList } from "@/components/oe-list";

export const metadata: Metadata = { title: "Ordens de Execução" };

export default async function Page({ searchParams }: { searchParams: Promise<{ nova?: string }> }) {
  const { nova } = await searchParams;
  return <OEList abrirNova={nova === "1"} />;
}
