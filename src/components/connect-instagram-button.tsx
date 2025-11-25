"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";

export function ConnectInstagramButton() {
	const supabase = createClientComponentClient();

	async function handleConnect() {
		const redirectTo =
			(typeof window !== "undefined" ? window.location.origin : "") + "/auth/callback";
		// ご要望に合わせて Instagram Login を使用
		const provider = "instagram" as any;
		// Graph用の最小スコープ
		const scopes = "instagram_basic";
		await supabase.auth.signInWithOAuth({ provider, options: { scopes, redirectTo } as any });
	}

	return (
		<Button onClick={handleConnect} type="button" variant="default">
			Instagramで続行
		</Button>
	);
}



