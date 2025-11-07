import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Pour le MVP, on laisse passer toutes les requêtes
  // L'authentification sera gérée côté client
  
  return res
}

export const config = {
  matcher: [] // Pas de protection pour le MVP
}
