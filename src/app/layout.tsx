import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Organograma Inteligente",
  description: "Gerenciador de organogramas de empresas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200">
          <nav className="max-w-4xl mx-auto flex items-center justify-between px-8 py-4">
            <a href="/" className="text-lg font-bold">
              Organograma
            </a>
            <div className="flex gap-6 text-sm">
              <a href="/colaboradores" className="text-zinc-600 hover:text-zinc-900">
                Colaboradores
              </a>
              <a href="/avaliacoes" className="text-zinc-600 hover:text-zinc-900">
                Avaliações
              </a>
              <a href="/iniciativas" className="text-zinc-600 hover:text-zinc-900">
                Iniciativas
              </a>
              <a href="/metricas" className="text-zinc-600 hover:text-zinc-900">
                Métricas
              </a>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
