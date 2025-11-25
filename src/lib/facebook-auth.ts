const FB_GRAPH_BASE = "https://graph.facebook.com";

type ExchangeResponse = {
	access_token: string;
	token_type?: string;
	expires_in?: number; // seconds (long-lived user tokenは60日程度)
};

export async function exchangeLongLivedUserToken(shortLivedUserToken: string): Promise<ExchangeResponse> {
	const appId = process.env.FACEBOOK_APP_ID;
	const appSecret = process.env.FACEBOOK_APP_SECRET;
	if (!appId || !appSecret) {
		throw new Error("FACEBOOK_APP_ID / FACEBOOK_APP_SECRET が未設定です。");
	}
	const url = `${FB_GRAPH_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
		appId,
	)}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(
		shortLivedUserToken,
	)}`;
	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Facebook長期トークン交換に失敗: ${res.status} ${body}`);
	}
	return (await res.json()) as ExchangeResponse;
}


