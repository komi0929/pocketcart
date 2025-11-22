"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";

export function ConnectInstagramButton() {
	const supabase = createClientComponentClient();

	async function handleConnect() {
		const redirectTo =
			(typeof window !== "undefined" ? window.location.origin : "") + "/auth/callback";
		const provider = (process.env.NEXT_PUBLIC_OAUTH_PROVIDER === "facebook"
			? "facebook"
			: "instagram") as any;
		const scopes =
			provider === "facebook"
				? // Facebook Login 経由で Instagram Graph API を使う際の最小権限（開発中・テスター想定）
				  "public_profile,email,pages_show_list,instagram_basic"
				: // Basic Display
				  "user_profile,user_media";
		await supabase.auth.signInWithOAuth({ provider, options: { scopes, redirectTo } as any });
	}

	return (
		<Button onClick={handleConnect} type="button" variant="default">
			{process.env.NEXT_PUBLIC_OAUTH_PROVIDER === "facebook"
				? "Facebookでログイン（Instagram連携）"
				: "Instagram と連携する"}
		</Button>
	);
}



