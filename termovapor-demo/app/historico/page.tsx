import type { Metadata } from "next";
import { Historico } from "@/components/historico";

export const metadata: Metadata = { title: "Histórico" };

export default function Page() {
  return <Historico />;
}
