import type { Metadata } from "next";
import { Provider } from "@/components/store";
import { Shell } from "@/components/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Termovapor · Plataforma operacional", template: "%s · Termovapor" },
  description: "Demonstração da plataforma operacional Termovapor: Ordens de Execução, Números de Fabrico e OIF Elétrico, com dados reais importados das bases fornecidas.",
  icons: { icon: "/favicon.svg" },
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>
        <Provider>
          <Shell>{children}</Shell>
        </Provider>
      </body>
    </html>
  );
}
