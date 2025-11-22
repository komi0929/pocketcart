"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
	const supabase = createClientComponentClient();
	const redirectTo =
		(typeof window !== "undefined" ? window.location.origin : "") + "/auth/callback";

	async function signInFacebook() {
		await supabase.auth.signInWithOAuth({
			provider: "facebook",
			options: {
				redirectTo,
				scopes: "public_profile,email,pages_show_list,instagram_basic",
			},
		});
	}

	return (
		<main className="mx-auto max-w-md px-6 py-16 text-center">
			<h1 className="text-2xl font-semibold">ログイン</h1>
			<p className="mt-2 text-muted-foreground">ダッシュボードの利用にはログインが必要です。</p>
			<div className="mt-6">
				<button
					onClick={signInFacebook}
					className="rounded bg-primary px-4 py-2 text-primary-foreground"
				>
					Facebookでログイン（Instagram連携）
				</button>
			</div>
		</main>
	);
}



