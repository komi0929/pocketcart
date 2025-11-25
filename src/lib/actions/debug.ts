"use server";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";

type DiagnoseResult = {
	authenticated: boolean;
	userId?: string;
	email?: string | null;
	providerTokenPresent: boolean;
	graph?: {
		accounts?: unknown;
		igUserId?: string | null;
		sampleMedia?: unknown;
	};
	errors?: { step: string; message: string }[];
};

export async function diagnoseInstagram(): Promise<DiagnoseResult> {
	const result: DiagnoseResult = {
		authenticated: false,
		providerTokenPresent: false,
		errors: [],
	};
	const supabase = createServerComponentClient({ cookies });
	const [{ data: userData }, { data: sessionData }] = await Promise.all([
		supabase.auth.getUser(),
		supabase.auth.getSession(),
	]);
	if (!userData.user) {
		result.errors?.push({ step: "auth", message: "未ログインです。" });
		return result;
	}
	result.authenticated = true;
	result.userId = userData.user.id;
	result.email = userData.user.email ?? null;
	const token = sessionData.session?.provider_token ?? null;
	if (!token) {
		result.errors?.push({ step: "token", message: "provider_token が見つかりません。" });
		return result;
	}
	result.providerTokenPresent = true;

	// Try Graph API (Facebook login route)
	try {
		const accountsRes = await fetch(
			`https://graph.facebook.com/v21.0/me/accounts?access_token=${encodeURIComponent(token)}`,
			{ cache: "no-store" },
		);
		const accounts = await accountsRes.json();
		result.graph = { accounts };
		const pageId = accounts?.data?.[0]?.id as string | undefined;
		if (!pageId) {
			result.errors?.push({ step: "accounts", message: "ページが見つかりません。" });
			return result;
		}
		const igRes = await fetch(
			`https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(
				token,
			)}`,
			{ cache: "no-store" },
		);
		const igJson = await igRes.json();
		const igUserId = igJson?.instagram_business_account?.id as string | undefined;
		result.graph.igUserId = igUserId ?? null;
		if (!igUserId) {
			result.errors?.push({ step: "igUser", message: "Instagramビジネスアカウント未連携の可能性。" });
			return result;
		}
		const mediaRes = await fetch(
			`https://graph.facebook.com/v21.0/${igUserId}/media?fields=id,caption,media_url,media_type,permalink&limit=5&access_token=${encodeURIComponent(
				token,
			)}`,
			{ cache: "no-store" },
		);
		const media = await mediaRes.json();
		result.graph.sampleMedia = media;
	} catch (e: any) {
		result.errors?.push({ step: "graph", message: String(e?.message ?? e) });
	}
	return result;
}






