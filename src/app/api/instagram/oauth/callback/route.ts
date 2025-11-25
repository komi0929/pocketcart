import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import { getFacebookPagesWithIg } from "@/lib/instagram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const error = url.searchParams.get("error");
	if (error) {
		return NextResponse.redirect("/onboarding/step1?error=" + encodeURIComponent(error));
	}
	if (!code) {
		return NextResponse.redirect("/onboarding/step1?error=missing_code");
	}
	const appId = process.env.INSTAGRAM_APP_ID;
	const appSecret = process.env.INSTAGRAM_APP_SECRET;
	const redirectUri =
		process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") +
		"/api/instagram/oauth/callback";
	if (!appId || !appSecret || !redirectUri) {
		return NextResponse.redirect("/onboarding/step1?error=missing_env");
	}
	// 1) code → access_token 交換
	const tokenRes = await fetch(
		`https://graph.facebook.com/v21.0/oauth/access_token?client_id=${encodeURIComponent(
			appId,
		)}&client_secret=${encodeURIComponent(appSecret)}&redirect_uri=${encodeURIComponent(
			redirectUri,
		)}&code=${encodeURIComponent(code)}`,
		{ cache: "no-store" },
	);
	if (!tokenRes.ok) {
		return NextResponse.redirect("/onboarding/step1?error=token_exchange_failed");
	}
	const tokenJson = (await tokenRes.json()) as { access_token: string };
	const accessToken = tokenJson?.access_token;
	if (!accessToken) {
		return NextResponse.redirect("/onboarding/step1?error=no_access_token");
	}
	// 2) アプリ内ユーザーの特定
	const supabase = createServerComponentClient({ cookies });
	const { data: userData } = await supabase.auth.getUser();
	if (!userData.user) {
		return NextResponse.redirect("/onboarding/step1?error=not_logged_in");
	}
	// 3) 保存（ユーザー行が無ければ作成）
	const dbUser =
		(await prisma.user.findUnique({ where: { authUserId: userData.user.id } })) ??
		(await prisma.user.create({
			data: {
				authUserId: userData.user.id,
				email: userData.user.email ?? null,
				name: userData.user.user_metadata?.name ?? null,
			},
		}));
	await prisma.user.update({
		where: { id: dbUser.id },
		data: { instagramAccessToken: accessToken },
	});
	// 4) 可能ならIGユーザーID/ユーザー名を取得して保存
	try {
		const pages = await getFacebookPagesWithIg(accessToken);
		const first = pages.find((p) => p.igUserId) ?? null;
		if (first?.igUserId) {
			await prisma.user.update({
				where: { id: dbUser.id },
				data: {
					instagramUserId: first.igUserId,
					instagramUsername: first.igUsername,
				},
			});
		}
	} catch {
		// ignore
	}
	// 5) STEP1に戻す（候補表示→選択確定フローはそのまま）
	return NextResponse.redirect("/onboarding/step1");
}


