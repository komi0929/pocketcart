import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import { exchangeLongLivedUserToken } from "@/lib/facebook-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
	try {
		const supabase = createServerComponentClient({ cookies });
		const [{ data: userData }, { data: sessionData }] = await Promise.all([
			supabase.auth.getUser(),
			supabase.auth.getSession(),
		]);
		if (!userData.user) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}
		const user = await prisma.user.findUnique({
			where: { authUserId: userData.user.id },
			select: { id: true, instagramAccessToken: true },
		});
		// 元のtokenがDBに無ければ、セッションの短期トークンから交換
		const baseToken = user?.instagramAccessToken ?? sessionData.session?.provider_token ?? null;
		if (!baseToken) {
			return NextResponse.json({ error: "no_token" }, { status: 400 });
		}
		const exchanged = await exchangeLongLivedUserToken(baseToken);
		await prisma.user.update({
			where: { id: user?.id },
			data: {
				instagramAccessToken: exchanged.access_token,
			},
		});
		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
	}
}


