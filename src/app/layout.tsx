import type { Metadata } from "next";
import "./globals.css";
import "../styles/glassmorphism.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/session-provider";

export const metadata: Metadata = {
  title: "Sistema de Gerenciamento de Projetos",
  description: "Gerencie seus projetos de forma eficiente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body
        className="font-sans antialiased bg-background text-foreground"
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            expand
            closeButton
          />
        </Providers>
      </body>
    </html>
  );
}
