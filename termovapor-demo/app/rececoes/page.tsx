import type { Metadata } from "next";
import { Rececoes } from "@/components/encomendas";

export const metadata: Metadata = { title: "Receções" };

export default function Page() {
  return <Rececoes />;
}
