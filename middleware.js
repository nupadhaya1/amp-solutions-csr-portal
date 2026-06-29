import { NextResponse } from "next/server";

import { isSystemDesignDocSlug } from "./src/lib/docs/support-doc-catalog.js";

export function middleware(request) {
  const slug = request.nextUrl.pathname.match(/^\/csr\/docs\/([^/]+)\/?$/)?.[1] || "";

  if (isSystemDesignDocSlug(slug)) {
    const url = request.nextUrl.clone();
    url.pathname = "/demo/systemDesign";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/csr/docs/:path*",
};
