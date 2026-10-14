import type { Metadata } from "next";
import { Artigos } from "@/components/artigos";

export const metadata: Metadata = { title: "Artigos e stock" };

export default async function Page({ searchParams }: { searchParams: Promise<{ vista?: string; pesquisa?: string }> }) {
  const { vista, pesquisa } = await searchParams;
  return <Artigos key={`${vista ?? "todos"}-${pesquisa ?? ""}`} vistaInicial={vista ?? "todos"} pesquisa={pesquisa ?? ""} />;
}
