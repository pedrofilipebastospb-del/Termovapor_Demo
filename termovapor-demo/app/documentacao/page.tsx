import type { Metadata } from "next";
import { Documentacao } from "@/components/documentos";

export const metadata: Metadata = { title: "Documentação" };

export default function Page() {
  return <Documentacao />;
}
