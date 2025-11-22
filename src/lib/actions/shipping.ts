"use server";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import { shippingRuleSchema, type ShippingRuleFormValues } from "@/lib/validations/shipping";

async function getAuthUser() {
	const supabase = createServerComponentClient({ cookies });
	const { data, error } = await supabase.auth.getUser();
	if (error || !data.user) {
		throw new Error("認証ユーザーを取得できませんでした。");
	}
	return data.user;
}

export async function getShippingRule() {
	const user = await getAuthUser();
	// User レコードを探す（存在しない場合は null 応答）
	const storeOwner = await prisma.user.findUnique({
		where: { authUserId: user.id },
		select: {
			id: true,
			shippingRule: true,
		},
	});
	if (!storeOwner?.shippingRule) {
		return null;
	}
	return storeOwner.shippingRule;
}

export async function updateShippingRule(input: ShippingRuleFormValues) {
	const parsed = shippingRuleSchema.safeParse(input);
	if (!parsed.success) {
		throw new Error("入力が不正です。");
	}
	const values = parsed.data;

	const user = await getAuthUser();

	// User を upsert（authUserId をキー）
	const storeOwner = await prisma.user.upsert({
		where: { authUserId: user.id },
		create: {
			authUserId: user.id,
			email: user.email ?? null,
			name: user.user_metadata?.name ?? null,
		},
		update: {},
	});

	// ShippingRule を upsert（userId は unique）
	const rule = await prisma.shippingRule.upsert({
		where: { userId: storeOwner.id },
		update: {
			hokkaido: values.hokkaido,
			tohoku: values.tohoku,
			kanto: values.kanto,
			chubu: values.chubu,
			kinki: values.kinki,
			chugoku: values.chugoku,
			shikoku: values.shikoku,
			kyushu: values.kyushu,
			okinawa: values.okinawa,
			cool_fee: values.cool_fee,
		},
		create: {
			userId: storeOwner.id,
			hokkaido: values.hokkaido,
			tohoku: values.tohoku,
			kanto: values.kanto,
			chubu: values.chubu,
			kinki: values.kinki,
			chugoku: values.chugoku,
			shikoku: values.shikoku,
			kyushu: values.kyushu,
			okinawa: values.okinawa,
			cool_fee: values.cool_fee,
		},
	});

	return rule;
}


