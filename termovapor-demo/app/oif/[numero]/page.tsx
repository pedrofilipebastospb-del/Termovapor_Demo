import type { Metadata } from "next";
import { OIFDetail } from "@/components/oif-detail";

export async function generateMetadata({ params }: { params: Promise<{ numero: string }> }): Promise<Metadata> {
  const { numero } = await params;
  return { title: decodeURIComponent(numero) };
}

export default async function Page({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  return <OIFDetail numero={decodeURIComponent(numero)} />;
}
