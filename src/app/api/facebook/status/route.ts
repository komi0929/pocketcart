import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const supabase = createServerComponentClient({ cookies });
		const { data } = await supabase.auth.getUser();
		if (!data.user) {
			return NextResponse.json({ error: "unauthorized" }, { status: 401 });
		}
		const user = await prisma.user.findUnique({
			where: { authUserId: data.user.id },
			select: {
				instagramUsername: true,
				instagramUserId: true,
				instagramAccessToken: true,
			},
		});
		return NextResponse.json({
			connected: Boolean(user?.instagramUserId),
			username: user?.instagramUsername ?? null,
			hasToken: Boolean(user?.instagramAccessToken),
		});
	} catch (e: any) {
		return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
	}
}


