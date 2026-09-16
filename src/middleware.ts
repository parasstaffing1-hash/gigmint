import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "gigmint_session";

// Route prefix → allowed roles
const GUARDED: { prefix: string; roles: string[] }[] = [
  { prefix: "/client", roles: ["client", "admin"] },
  { prefix: "/freelancer", roles: ["freelancer", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rule = GUARDED.find(
    (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/")
  );
  if (!rule) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Full role verification happens server-side (requireRole in layouts/actions);
  // middleware only does the cheap cookie presence check to avoid a DB hop.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/client/:path*",
    "/freelancer/:path*",
    "/admin/:path*",
  ],
};
