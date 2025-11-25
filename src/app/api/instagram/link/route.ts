import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import { exchangeLongLivedUserToken } from "@/lib/facebook-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	try {
		const supabase = createServerComponentClient({ cookies });
		const [{ data: userData }, { data: sessionData }] = await Promise.all([
			supabase.auth.getUser(),
			supabase.auth.getSession(),
		]);
		if (!userData.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		const body = (await request.json()) as { igUserId: string; igUsername?: string | null };
		if (!body?.igUserId) {
			return NextResponse.json({ error: "missing_ig_user_id" }, { status: 400 });
		}
		// ユーザー行を確保
		const dbUser =
			(await prisma.user.findUnique({ where: { authUserId: userData.user.id } })) ??
			(await prisma.user.create({
				data: {
					authUserId: userData.user.id,
					email: userData.user.email ?? null,
					name: userData.user.user_metadata?.name ?? null,
				},
			}));
		// 長期ユーザートークンに交換（可能なら）
		const providerToken = sessionData.session?.provider_token ?? null;
		let storedToken: string | null = null;
		if (providerToken) {
			try {
				const exchanged = await exchangeLongLivedUserToken(providerToken);
				storedToken = exchanged.access_token;
			} catch {
				// 交換失敗は許容（連携自体は続行）
			}
		}
		await prisma.user.update({
			where: { id: dbUser.id },
			data: {
				instagramUserId: body.igUserId,
				instagramUsername: body.igUsername ?? null,
				...(storedToken ? { instagramAccessToken: storedToken } : {}),
			},
		});
		return NextResponse.json({ ok: true });
	} catch (e: unknown) {
		return NextResponse.json({ error: String(e) }, { status: 500 });
	}
}


