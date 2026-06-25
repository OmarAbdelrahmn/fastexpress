import { NextResponse } from 'next/server';
import { APP_DEFAULT_PATHS, APP_HOSTS, getAppFromHost } from '@/lib/config/appConfig';

function isLocalDevHost(request) {
  const hostname = request.nextUrl.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || request.nextUrl.port === '3000';
}

function redirectToHost(request, host, pathname) {
  const url = request.nextUrl.clone();
  url.hostname = host;
  url.pathname = pathname;
  url.search = '';
  return NextResponse.redirect(url);
}

export function proxy(request) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next();
  }

  const app = getAppFromHost(request.headers.get('host') || '');

  if (app === 'website') {
    if (isLocalDevHost(request)) {
      return NextResponse.next();
    }

    if (pathname.startsWith('/admin')) {
      return redirectToHost(request, APP_HOSTS.admin, pathname);
    }
    if (pathname.startsWith('/member')) {
      return redirectToHost(request, APP_HOSTS.supervisor, pathname);
    }
    if (pathname.startsWith('/accountant')) {
      return redirectToHost(request, APP_HOSTS.accountant, pathname);
    }
    return NextResponse.next();
  }

  if (app === 'admin') {
    if (pathname === '/') {
      return NextResponse.redirect(new URL(APP_DEFAULT_PATHS.admin, request.url));
    }
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/language')) {
      return NextResponse.redirect(new URL(APP_DEFAULT_PATHS.admin, request.url));
    }
    return NextResponse.next();
  }

  if (app === 'supervisor') {
    if (pathname === '/') {
      return NextResponse.redirect(new URL(APP_DEFAULT_PATHS.supervisor, request.url));
    }
    if (!pathname.startsWith('/member') && !pathname.startsWith('/language')) {
      return NextResponse.redirect(new URL(APP_DEFAULT_PATHS.supervisor, request.url));
    }
    return NextResponse.next();
  }

  if (app === 'accountant') {
    if (pathname === '/') {
      return NextResponse.redirect(new URL(APP_DEFAULT_PATHS.accountant, request.url));
    }
    if (!pathname.startsWith('/accountant') && !pathname.startsWith('/language')) {
      return NextResponse.redirect(new URL(APP_DEFAULT_PATHS.accountant, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
