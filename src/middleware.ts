import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req, res });
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// ダッシュボード配下は認証必須
	if (req.nextUrl.pathname.startsWith("/dashboard")) {
		if (!user) {
			const loginUrl = new URL("/login", req.url);
			loginUrl.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
			return NextResponse.redirect(loginUrl);
		}
	}
	return res;
}

export const config = {
	matcher: ["/dashboard/:path*"],
};



