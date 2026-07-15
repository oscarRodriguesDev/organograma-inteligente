import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/auth-actions";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";

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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <nav className="max-w-5xl mx-auto flex items-center justify-between px-8 py-4">
              <a href="/" className="text-lg font-bold text-foreground">
                Organograma
              </a>
              {session && (
                <>
                  <div className="flex gap-6 text-sm">
                    <a href="/organograma" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                      Organograma
                    </a>
                    <a href="/colaboradores" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                      Colaboradores
                    </a>
                    <a href="/avaliacoes" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                      Avaliações
                    </a>
                    <a href="/iniciativas" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                      Iniciativas
                    </a>
                    <a href="/metricas" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                      Métricas
                    </a>
                    <a href="/regras-impacto" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                      Regras
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <ThemeToggle />
                    <span className="text-zinc-500 dark:text-zinc-400">{session.nome}</span>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
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
        </ThemeProvider>
      </body>
    </html>
  );
}
