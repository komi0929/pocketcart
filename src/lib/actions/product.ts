"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import { getInstagramMedia, getInstagramProfile } from "@/lib/instagram";
import { parsePriceFromCaption } from "@/utils/price-parser";

function hasActiveHashtag(caption?: string | null): boolean {
	if (!caption) return false;
	// #販売中 / #在庫あり などを true に
	return /#販売中|#在庫あり|#available/i.test(caption);
}

async function getAuthAndToken() {
	const supabase = createServerComponentClient({ cookies });
	const [{ data: userData }, { data: sessionData }] = await Promise.all([
		supabase.auth.getUser(),
		supabase.auth.getSession(),
	]);
	if (!userData.user) throw new Error("未認証です。");
	const accessToken = sessionData.session?.provider_token ?? null;
	return {
		user: userData.user,
		accessToken,
	};
}

export async function syncInstagramPosts(
	accessToken?: string,
	options?: { maxItems?: number; excludeVideo?: boolean },
) {
	const { user, accessToken: sessionToken } = await getAuthAndToken();
	const token = accessToken ?? sessionToken;
	if (!token) {
		throw new Error("Instagram アクセストークンが見つかりません。先に連携してください。");
	}

	// Ensure User row
	const dbUser = await prisma.user.upsert({
		where: { authUserId: user.id },
		create: {
			authUserId: user.id,
			email: user.email ?? null,
			name: user.user_metadata?.name ?? null,
		},
		update: {},
	});

	// Update profile info
	try {
		const profile = await getInstagramProfile(token);
		await prisma.user.update({
			where: { id: dbUser.id },
			data: {
				instagramUserId: profile.id,
				instagramUsername: profile.username,
			},
		});
	} catch {
		// ignore
	}

	const media = await getInstagramMedia(token, options?.maxItems ?? 50);

	let upserted = 0;
	for (const item of media) {
		if (options?.excludeVideo && item.media_type === "VIDEO") continue;
		// Skip unsupported types if needed, e.g., VIDEO can still have media_url (thumbnail). Keep simple here.
		const title =
			item.caption?.split("\n")[0]?.slice(0, 100) ||
			`Instagram Post ${item.id}`;
		const price = parsePriceFromCaption(item.caption) ?? 0;
		const isActive = hasActiveHashtag(item.caption);

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
		upserted += 1;
	}

	revalidatePath("/dashboard/products");
	return { count: upserted };
}



