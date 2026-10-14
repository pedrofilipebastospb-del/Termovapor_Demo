import type { Metadata } from "next";
import { PesquisaDocumentos } from "@/components/documentos";

export const metadata: Metadata = { title: "Pesquisar documentos" };

export default function Page() {
  return <PesquisaDocumentos />;
}
