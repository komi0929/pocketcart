"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";

export function ConnectInstagramButton() {
	const supabase = createClientComponentClient();

	async function handleConnect() {
		// 自前のInstagram OAuthフローへ
		if (typeof window !== "undefined") {
			window.location.href = "/api/instagram/oauth/authorize";
		}
	}

	return (
		<Button onClick={handleConnect} type="button" variant="default">
			Instagramで続行
		</Button>
	);
}



