import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/auth-actions";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200">
          <nav className="max-w-5xl mx-auto flex items-center justify-between px-8 py-4">
            <a href="/" className="text-lg font-bold">
              Organograma
            </a>
            {session && (
              <>
                <div className="flex gap-6 text-sm">
                  <a href="/organograma" className="text-zinc-600 hover:text-zinc-900">
                    Organograma
                  </a>
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
                  <a href="/regras-impacto" className="text-zinc-600 hover:text-zinc-900">
                    Regras
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-zinc-500">{session.nome}</span>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="text-xs text-zinc-400 hover:text-zinc-700"
                    >
                      Sair
                    </button>
                  </form>
                </div>
              </>
            )}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
