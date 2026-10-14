import type { Metadata } from "next";
import { Quadros } from "@/components/quadros";

export const metadata: Metadata = { title: "Quadros / SEE" };

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <Quadros key={q ?? "todos"} initial={q} />;
}
