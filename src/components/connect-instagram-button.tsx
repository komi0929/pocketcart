"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";

export function ConnectInstagramButton() {
	const supabase = createClientComponentClient();

	async function handleConnect() {
		const redirectTo =
			(typeof window !== "undefined" ? window.location.origin : "") + "/auth/callback";
		// Graph API 前提: Facebook ログインのみ
		const provider = "facebook" as any;
		const scopes =
			"public_profile,email,pages_show_list,instagram_basic";
		await supabase.auth.signInWithOAuth({ provider, options: { scopes, redirectTo } as any });
	}

	return (
		<Button onClick={handleConnect} type="button" variant="default">
			Instagramで続行
		</Button>
	);
}



