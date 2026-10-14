import type { Metadata } from "next";
import { Fornecedores } from "@/components/encomendas";

export const metadata: Metadata = { title: "Fornecedores" };

export default function Page() {
  return <Fornecedores />;
}
