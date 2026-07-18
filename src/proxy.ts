import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret')
const COOKIE_NAME = 'session'

const PUBLIC_ROUTES = ['/login', '/', '/checkout', '/onboarding']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permite arquivos estáticos e API
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

  // Rotas públicas não precisam de autenticação
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  // Verifica o token
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
