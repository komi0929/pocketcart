const FB_GRAPH_BASE = "https://graph.facebook.com/v21.0";

type MediaItem = {
	id: string;
	caption?: string;
	media_url: string;
	media_type: string;
	permalink: string;
};

type Profile = {
	id: string;
	username?: string;
	account_type?: string;
};

type FbPage = { id: string; name?: string };

export async function getInstagramMedia(
	accessToken: string,
	maxCount = 50,
	options?: { igUserId?: string | null },
): Promise<MediaItem[]> {
	const fields = ["id", "caption", "media_url", "media_type", "permalink"].join(",");
	// 0) 直接 IG ユーザーIDが分かっている場合（Instagram Login想定）
	if (options?.igUserId) {
		let url = `${FB_GRAPH_BASE}/${options.igUserId}/media?fields=${fields}&access_token=${encodeURIComponent(
		 accessToken,
		)}`;
		let items: MediaItem[] = [];
		for (let i = 0; i < 10 && items.length < maxCount; i++) {
			const resp = await fetch(url, { cache: "no-store" });
			if (!resp.ok) break;
			const json = await resp.json();
			if (Array.isArray(json?.data)) {
				items.push(...(json.data as MediaItem[]));
				if (items.length >= maxCount) break;
				const next = json?.paging?.next as string | undefined;
				if (!next) break;
				url = next;
				continue;
			}
			break;
		}
		if (items.length > 0) return items.slice(0, maxCount);
	}
	// Facebook Login 経由（Instagram Graph API）
	{
		// ページ取得
		const meAccounts = await fetch(
			`${FB_GRAPH_BASE}/me/accounts?access_token=${encodeURIComponent(accessToken)}`,
			{ cache: "no-store" },
		);
		if (!meAccounts.ok) {
			throw new Error("Facebook ページの取得に失敗しました。権限や接続を確認してください。");
		}
		const accountsJson = await meAccounts.json();
		const pages: { id: string }[] = accountsJson?.data ?? [];
		if (!pages.length) return [];
		const pageId = pages[0].id;
		// IGユーザー
		const igResp = await fetch(
			`${FB_GRAPH_BASE}/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(
				accessToken,
			)}`,
			{ cache: "no-store" },
		);
		if (!igResp.ok) {
			throw new Error("Instagram ビジネスアカウントの取得に失敗しました。");
		}
		const igJson = await igResp.json();
		const igUserId = igJson?.instagram_business_account?.id as string | undefined;
		if (!igUserId) return [];
		// メディア ページング
		let url = `${FB_GRAPH_BASE}/${igUserId}/media?fields=${fields}&access_token=${encodeURIComponent(
			accessToken,
		)}`;
		let items: MediaItem[] = [];
		for (let i = 0; i < 10 && items.length < maxCount; i++) {
			const resp = await fetch(url, { cache: "no-store" });
			if (!resp.ok) break;
			const json = await resp.json();
			if (Array.isArray(json?.data)) {
				items.push(...(json.data as MediaItem[]));
				if (items.length >= maxCount) break;
				const next = json?.paging?.next as string | undefined;
				if (!next) break;
				url = next;
				continue;
			}
			break;
		}
		return items.slice(0, maxCount);
	}
}

export async function getInstagramProfile(accessToken: string): Promise<Profile> {
	// Facebook Graph 経由（ページ→IGユーザー）
	{
		const meAccounts = await fetch(
			`${FB_GRAPH_BASE}/me/accounts?access_token=${encodeURIComponent(accessToken)}`,
			{ cache: "no-store" },
		);
		if (!meAccounts.ok) {
			throw new Error("Facebook ページの取得に失敗しました。");
		}
		const accountsJson = await meAccounts.json();
		const pages: { id: string; name?: string }[] = accountsJson?.data ?? [];
		if (!pages.length) {
			return { id: "unknown" };
		}
		const pageId = pages[0].id;
		const igResp = await fetch(
			`${FB_GRAPH_BASE}/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(
				accessToken,
			)}`,
			{ cache: "no-store" },
		);
		if (!igResp.ok) {
			return { id: "unknown" };
		}
		const igJson = await igResp.json();
		const igUserId = igJson?.instagram_business_account?.id as string | undefined;
		if (!igUserId) {
			return { id: "unknown" };
		}
		// 追加情報（username）は別権限が必要なので省略し ID のみ返却
		return { id: igUserId, username: undefined, account_type: "BUSINESS" };
	}
}

export async function getFacebookPagesWithIg(
	accessToken: string,
): Promise<Array<{ pageId: string; pageName: string | null; igUserId: string | null; igUsername: string | null }>> {
	// 1) /me/accounts でページ一覧
	const meAccounts = await fetch(
		`${FB_GRAPH_BASE}/me/accounts?access_token=${encodeURIComponent(accessToken)}`,
		{ cache: "no-store" },
	);
	if (!meAccounts.ok) return [];
	const accountsJson = (await meAccounts.json()) as { data?: FbPage[] };
	const pages: FbPage[] = accountsJson?.data ?? [];
	const results: Array<{
		pageId: string;
		pageName: string | null;
		igUserId: string | null;
		igUsername: string | null;
	}> = [];
	for (const p of pages) {
		// 2) ページ → instagram_business_account
		const igResp = await fetch(
			`${FB_GRAPH_BASE}/${p.id}?fields=instagram_business_account&access_token=${encodeURIComponent(
				accessToken,
			)}`,
			{ cache: "no-store" },
		);
		if (!igResp.ok) {
			results.push({ pageId: p.id, pageName: p.name ?? null, igUserId: null, igUsername: null });
			continue;
		}
		const igJson = await igResp.json();
		const igUserId = (igJson?.instagram_business_account?.id as string | undefined) ?? null;
		let igUsername: string | null = null;
		if (igUserId) {
			const uname = await fetch(
				`${FB_GRAPH_BASE}/${igUserId}?fields=username&access_token=${encodeURIComponent(accessToken)}`,
				{ cache: "no-store" },
			);
			if (uname.ok) {
				const j = await uname.json();
				igUsername = (j?.username as string | undefined) ?? null;
			}
		}
		results.push({
			pageId: p.id,
			pageName: p.name ?? null,
			igUserId,
			igUsername,
		});
	}
	return results;
}



