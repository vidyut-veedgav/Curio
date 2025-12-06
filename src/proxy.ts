import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Protected routes that require authentication
  const protectedRoutes = ["/home", "/session"];

  // Check if current path needs protection
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // Redirect to landing page if not authenticated and accessing protected route
  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
