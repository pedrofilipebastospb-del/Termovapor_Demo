import type { Metadata } from "next";
import { OIFList } from "@/components/oif-list";

export const metadata: Metadata = { title: "OIF / Produção" };

export default function Page() {
  return <OIFList />;
}
