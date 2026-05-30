import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // getUser(). A simple mistake can make it very hard to debug
  // issues with users being logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // 1. Root page "/" redirection
  if (url.pathname === '/') {
    if (user) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    } else {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // 2. Auth routes: redirect logged in users away from login/signup
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/signup')) {
    if (user) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // 3. Protected routes: redirect unauthenticated users to login
  if (
    !user &&
    !url.pathname.startsWith('/login') &&
    !url.pathname.startsWith('/signup') &&
    !url.pathname.startsWith('/auth') &&
    !url.pathname.startsWith('/api') &&
    !url.pathname.startsWith('/_next') &&
    url.pathname !== '/'
  ) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (internal Next.js routes, static files, HMR)
     * - api (API routes)
     * - favicon.ico (favicon file)
     * - sw.js, manifest.json (PWA files)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next|api|favicon.ico|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
