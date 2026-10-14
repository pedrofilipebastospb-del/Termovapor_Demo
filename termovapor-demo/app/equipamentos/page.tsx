import type { Metadata } from "next";
import { Equipamentos } from "@/components/equipamentos";

export const metadata: Metadata = { title: "Equipamentos / NF" };

export default function Page() {
  return <Equipamentos />;
}
