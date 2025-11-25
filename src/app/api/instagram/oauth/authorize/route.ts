import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	const appId = process.env.INSTAGRAM_APP_ID;
	// ベースURLはENV優先、無ければ現在のホストから生成
	const hdrs = await headers();
	const host = hdrs.get("host");
	const proto = hdrs.get("x-forwarded-proto") || "https";
	const origin =
		process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
		(host ? `${proto}://${host}` : "");
	const redirectUri = origin ? `${origin}/api/instagram/oauth/callback` : "";
	if (!appId || !redirectUri) {
		return NextResponse.json({ error: "missing_env" }, { status: 500 });
	}
	// Graph OAuth（Instagram Loginもこのエンドポイント）
	const scope = encodeURIComponent("instagram_basic,pages_show_list");
	const url = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
		redirectUri,
	)}&response_type=code&scope=${scope}`;
	return NextResponse.redirect(url);
}


