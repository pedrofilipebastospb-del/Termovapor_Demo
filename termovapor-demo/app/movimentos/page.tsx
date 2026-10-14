import type { Metadata } from "next";
import { Movimentos } from "@/components/artigos";

export const metadata: Metadata = { title: "Movimentos de stock" };

export default function Page() {
  return <Movimentos />;
}
