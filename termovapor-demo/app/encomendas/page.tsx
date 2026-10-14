import type { Metadata } from "next";
import { Encomendas } from "@/components/encomendas";

export const metadata: Metadata = { title: "Compras" };

export default function Page() {
  return <Encomendas />;
}
