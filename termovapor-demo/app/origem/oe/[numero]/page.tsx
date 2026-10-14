import type { Metadata } from "next";
import { OrigemOE } from "@/components/origem";

export async function generateMetadata({ params }: { params: Promise<{ numero: string }> }): Promise<Metadata> {
  const { numero } = await params;
  return { title: `Origem OE ${numero}` };
}

export default async function Page({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  return <OrigemOE numero={Number(numero)} />;
}
