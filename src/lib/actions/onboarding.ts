"use server";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { logEventWithAuth } from "@/lib/analytics";

export async function saveInitialSettings(formData: FormData) {
	const shopName = String(formData.get("shopName") || "").trim();
	const shopSlug = String(formData.get("shopSlug") || "").trim();
	const shippingType = String(formData.get("shippingType") || "flat");
	const flatFee = Number(formData.get("flatFee") || 0);

	if (!shopName || !shopSlug) {
		throw new Error("ショップ名とURLは必須です。");
	}

	const supabase = createServerComponentClient({ cookies });
	const { data: userData } = await supabase.auth.getUser();
	if (!userData?.user) {
		redirect("/login?toast=ログインしてください");
	}

	// User 保存
	const dbUser = await prisma.user.upsert({
		where: { authUserId: userData.user.id },
		update: { shopName, shopSlug, name: userData.user.user_metadata?.name ?? null },
		create: {
			authUserId: userData.user.id,
			email: userData.user.email ?? null,
			name: userData.user.user_metadata?.name ?? null,
			shopName,
			shopSlug,
		},
	});

	// 送料ルール（未登録なら作成）
	const existing = await prisma.shippingRule.findUnique({ where: { userId: dbUser.id } });
	if (!existing) {
		await prisma.shippingRule.create({
			data: {
				userId: dbUser.id,
				hokkaido: flatFee,
				tohoku: flatFee,
				kanto: flatFee,
				chubu: flatFee,
				kinki: flatFee,
				chugoku: flatFee,
				shikoku: flatFee,
				kyushu: flatFee,
				okinawa: flatFee,
				cool_fee: 330,
			},
		});
	}

	// 計測: オンボ完了
	await logEventWithAuth("onboarding_completed", "/onboarding/step4", {
		shipping: shippingType,
	});

	redirect("/dashboard/settings?toast=初期設定を保存しました");
}


