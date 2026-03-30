import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/sign-in$/,
  /^\/sign-up$/,
  /^\/api\/auth(?:\/.*)?$/,
  /^\/api\/unsubscribe\/.+$/,
  /^\/api\/webhooks\/email$/
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  if (!request.auth && !isPublicRoute(pathname)) {
    const signInUrl = new URL("/sign-in", request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (request.auth && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"]
};
