const IG_BASIC_BASE = "https://graph.instagram.com";
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

export async function getInstagramMedia(accessToken: string, maxCount = 50): Promise<MediaItem[]> {
	const fields = ["id", "caption", "media_url", "media_type", "permalink"].join(",");
	// 1) Basic Display 経由（provider_token が Instagram の場合）: ページング対応
	{
		let url = `${IG_BASIC_BASE}/me/media?fields=${fields}&access_token=${encodeURIComponent(
			accessToken,
		)}`;
		let items: MediaItem[] = [];
		for (let i = 0; i < 10 && items.length < maxCount; i++) {
			const res = await fetch(url, { cache: "no-store" });
			if (!res.ok) break;
			const data = await res.json();
			if (Array.isArray(data?.data)) {
				items.push(...(data.data as MediaItem[]));
				if (items.length >= maxCount) break;
				const next = data?.paging?.next as string | undefined;
				if (!next) break;
				url = next;
				continue;
			}
			break;
		}
		if (items.length > 0) {
			return items.slice(0, maxCount);
		}
	}
	// 2) Facebook Login 経由（Instagram Graph API）
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
	// Basic Display
	{
		const fields = ["id", "username", "account_type"].join(",");
		const url = `${IG_BASIC_BASE}/me?fields=${fields}&access_token=${encodeURIComponent(
			accessToken,
		)}`;
		const res = await fetch(url, { cache: "no-store" });
		if (res.ok) {
			return (await res.json()) as Profile;
		}
	}
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



