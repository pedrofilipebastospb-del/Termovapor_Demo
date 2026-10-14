import type { Metadata } from "next";
import { OEDetail } from "@/components/oe-detail";

export async function generateMetadata({ params }: { params: Promise<{ numero: string }> }): Promise<Metadata> {
  const { numero } = await params;
  return { title: `OE ${numero}` };
}

export default async function Page({ params, searchParams }: { params: Promise<{ numero: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { numero } = await params;
  const { tab } = await searchParams;
  return <OEDetail key={`${numero}-${tab ?? ""}`} numero={Number(numero)} tabInicial={tab} />;
}
