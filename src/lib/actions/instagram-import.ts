"use server";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { getInstagramMedia, getInstagramProfile } from "@/lib/instagram";
import { prisma } from "@/lib/prisma";
import { parsePriceFromCaption } from "@/utils/price-parser";

async function getAuthAndToken() {
	const supabase = createServerComponentClient({ cookies });
	const [{ data: userData }, { data: sessionData }] = await Promise.all([
		supabase.auth.getUser(),
		supabase.auth.getSession(),
	]);
	if (!userData.user) throw new Error("未認証です。");
	const accessToken = sessionData.session?.provider_token ?? null;
	return { user: userData.user, accessToken };
}

export async function loadRecentMedia(maxItems = 50) {
	const { accessToken } = await getAuthAndToken();
	if (!accessToken) throw new Error("アクセストークンがありません。");
	return await getInstagramMedia(accessToken, maxItems);
}

export async function importSelectedMedia(ids: string[]) {
	const { user, accessToken } = await getAuthAndToken();
	if (!accessToken) throw new Error("アクセストークンがありません。");
	// Ensure owner
	const dbUser = await prisma.user.upsert({
		where: { authUserId: user.id },
		create: {
			authUserId: user.id,
			email: user.email ?? null,
			name: user.user_metadata?.name ?? null,
		},
		update: {},
	});
	try {
		const profile = await getInstagramProfile(accessToken);
		await prisma.user.update({
			where: { id: dbUser.id },
			data: { instagramUserId: profile.id, instagramUsername: profile.username },
		});
	} catch {}
	const media = await getInstagramMedia(accessToken, 100);
	const selected = media.filter((m) => ids.includes(m.id));
	let count = 0;
	for (const item of selected) {
		const title = item.caption?.split("\n")[0]?.slice(0, 100) || `Instagram Post ${item.id}`;
		const price = parsePriceFromCaption(item.caption) ?? 0;
		const isActive = /#販売中|#在庫あり|#available/i.test(item.caption ?? "");
		await prisma.product.upsert({
			where: { instagram_media_id: item.id },
			update: {
				userId: dbUser.id,
				title,
				description: item.caption ?? null,
				imageUrl: item.media_url,
				price,
				stock: 0,
				requires_cool: false,
				is_active: isActive,
			},
			create: {
				userId: dbUser.id,
				title,
				description: item.caption ?? null,
				imageUrl: item.media_url,
				price,
				stock: 0,
				requires_cool: false,
				is_active: isActive,
				instagram_media_id: item.id,
			},
		});
		count++;
	}
	return { count };
}




