import type { Metadata } from "next";
import { Clientes } from "@/components/clientes";

export const metadata: Metadata = { title: "Clientes" };

export default async function Page({ searchParams }: { searchParams: Promise<{ pesquisa?: string }> }) {
  const { pesquisa } = await searchParams;
  return <Clientes key={pesquisa ?? ""} pesquisa={pesquisa ?? ""} />;
}
