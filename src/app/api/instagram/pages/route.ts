import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { getFacebookPagesWithIg } from "@/lib/instagram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const supabase = createServerComponentClient({ cookies });
		const { data: session } = await supabase.auth.getSession();
		const token = session.session?.provider_token ?? null;
		if (!token) return NextResponse.json({ loggedIn: false, pages: [] });
		let pages = await getFacebookPagesWithIg(token);
		// Instagram Login（ページに紐づかないトークン）のフォールバック
		if (!pages.length) {
			// Try IG Graph 'me?fields=id,username'
			let igUserId: string | null = null;
			let igUsername: string | null = null;
			try {
				const res1 = await fetch(
					`https://graph.facebook.com/v21.0/me?fields=id,username&access_token=${encodeURIComponent(
						token,
					)}`,
					{ cache: "no-store" },
				);
				if (res1.ok) {
					const j = await res1.json();
					igUserId = (j?.id as string | undefined) ?? null;
					igUsername = (j?.username as string | undefined) ?? null;
				}
			} catch {
				// ignore
			}
			if (!igUserId) {
				try {
					const res2 = await fetch(
						`https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(
							token,
						)}`,
						{ cache: "no-store" },
					);
					if (res2.ok) {
						const j = await res2.json();
						igUserId = (j?.id as string | undefined) ?? null;
						igUsername = (j?.username as string | undefined) ?? null;
					}
				} catch {
					// ignore
				}
			}
			if (igUserId) {
				pages = [
					{
						pageId: "direct-ig",
						pageName: null,
						igUserId,
						igUsername,
					},
				];
			}
		}
		return NextResponse.json({ loggedIn: true, pages });
	} catch (e: unknown) {
		return NextResponse.json({ loggedIn: false, pages: [], error: String(e) }, { status: 500 });
	}
}


