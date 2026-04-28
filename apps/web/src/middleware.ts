import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/cerebro.html') {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const decodedValue = atob(authValue);
      const [user, pwd] = decodedValue.split(':');

      // Admin credentials
      if (user === 'admin' && pwd === 'rwoman2025') {
        return NextResponse.next();
      }
    }
    
    return new NextResponse('Acesso restrito ao administrador.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Area de Administracao rWoman"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cerebro.html'],
};
