"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import { getInstagramMedia, getInstagramProfile } from "@/lib/instagram";
import { parsePriceFromCaption } from "@/utils/price-parser";
import { exchangeLongLivedUserToken } from "@/lib/facebook-auth";

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
	const providerToken = sessionData.session?.provider_token ?? null;

	// 既存ユーザー/保存済みトークンを確認
	const dbUser =
		(await prisma.user.findUnique({
			where: { authUserId: userData.user.id },
		})) ??
		(await prisma.user.create({
			data: {
				authUserId: userData.user.id,
				email: userData.user.email ?? null,
				name: userData.user.user_metadata?.name ?? null,
			},
		}));

	// 1) 保存済みの長期トークンが有効ならそれを使う
	if (dbUser.instagramAccessToken) {
		return { user: userData.user, accessToken: dbUser.instagramAccessToken };
	}

	// 2) 保存がなければ、Supabaseの provider_token（短期Facebookユーザートークン）を長期へ交換して保存
	if (providerToken) {
		try {
			const exchanged = await exchangeLongLivedUserToken(providerToken);
			// プロフィールも取得して保存（username等）
			let profileId: string | undefined;
			let profileUsername: string | undefined;
			try {
				const profile = await getInstagramProfile(exchanged.access_token);
				profileId = profile.id;
				profileUsername = profile.username;
			} catch {
				// ignore
			}
			await prisma.user.update({
				where: { id: dbUser.id },
				data: {
					instagramAccessToken: exchanged.access_token,
					instagramUserId: profileId,
					instagramUsername: profileUsername,
				},
			});
			return { user: userData.user, accessToken: exchanged.access_token };
		} catch {
			// フォールバックとして短期トークンを返す（同期処理は通す）
			return { user: userData.user, accessToken: providerToken };
		}
	}

	// 3) どれも無ければ未連携
	return { user: userData.user, accessToken: null };
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

	const media = await getInstagramMedia(token, options?.maxItems ?? 50, {
		igUserId: dbUser.instagramUserId ?? null,
	});

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



