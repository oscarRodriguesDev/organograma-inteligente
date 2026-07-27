import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { listarTestesDisponiveisEmpresa } from "@/lib/db";
import ThemeProvider from "@/components/ThemeProvider";
import ToastProvider from "@/components/ToastProvider";
import NavBar from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OxyGen AI — O ar que sua organização precisa",
  description: "Plataforma de inteligência organizacional que oxigena a gestão de pessoas com organogramas, avaliações, testes, métricas e IA.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'OxyGen AI',
    description: 'O ar que sua organização precisa.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  // Busca testes disponíveis para a empresa do usuário logado
  let testesDisponiveis: { id: string; titulo: string; tipo: string }[] = []
  if (session?.empresaId) {
    try {
      const testes = await listarTestesDisponiveisEmpresa(session.empresaId)
      testesDisponiveis = testes.map(t => ({ id: t.id, titulo: t.titulo, tipo: t.tipo }))
    } catch {
      // Silencia erro para não quebrar a navegação
    }
  }

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <NavBar session={session} testesDisponiveis={testesDisponiveis} />
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
