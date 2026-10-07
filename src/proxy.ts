import { NextRequest, NextResponse } from 'next/server';
export function proxy(r: NextRequest) {
  const p = r.nextUrl.pathname;
  if (/^\/(fr|en)(\/|$)/.test(p)) return;
  r.nextUrl.pathname = '/fr' + (p === '/' ? '' : p);
  return NextResponse.redirect(r.nextUrl);
}
export const config = { matcher: ['/((?!_next|api|admin|uploads|.*\\..*).*)'] };
