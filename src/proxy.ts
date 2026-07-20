import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/', '/checkout', '/onboarding']

/**
 * Proxy (equivalente ao middleware do Next.js padrão).
 *
 * Diferentemente do middleware tradicional, este proxy NÃO redireciona
 * páginas inexistentes para login — ele deixa o Next.js renderizar 404
 * naturalmente. A autenticação é feita por cada página individualmente
 * via `if (!session) redirect('/login')`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permite arquivos estáticos e recursos
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/file.svg') ||
    pathname.startsWith('/globe.svg') ||
    pathname.startsWith('/next.svg') ||
    pathname.startsWith('/vercel.svg') ||
    pathname.startsWith('/window.svg')
  ) {
    return NextResponse.next()
  }

  // Rotas públicas: sempre permitidas
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  // Rotas de API públicas
  if (pathname.startsWith('/api/public/') || pathname === '/api/upload-foto') {
    return NextResponse.next()
  }

  // Para todo o resto (páginas protegidas, APIs privadas, rotas inexistentes),
  // deixa passar — a página/rota lida com a própria autenticação.
  // Isso garante que rotas inexistentes mostrem 404 em vez de redirecionar.
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
