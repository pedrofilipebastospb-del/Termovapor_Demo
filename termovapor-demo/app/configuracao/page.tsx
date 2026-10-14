import type { Metadata } from "next";
import { Configuracao } from "@/components/configuracao";

export const metadata: Metadata = { title: "Configuração" };

export default function Page() {
  return <Configuracao />;
}
