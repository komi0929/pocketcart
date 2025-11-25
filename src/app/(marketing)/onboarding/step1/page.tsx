'use client';

import { OnboardingProgress } from "@/components/onboarding/Progress";
import { ConnectInstagramButton } from "@/components/connect-instagram-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import * as React from "react";

export default function Step1() {
	const [loading, setLoading] = React.useState(false);
	const [loggedIn, setLoggedIn] = React.useState(false);
	const [pages, setPages] = React.useState<
		Array<{ pageId: string; pageName: string | null; igUserId: string | null; igUsername: string | null }>
	>([]);
	const [selected, setSelected] = React.useState<string | null>(null);

	React.useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoading(true);
				const res = await fetch("/api/instagram/pages", { cache: "no-store" });
				const json = await res.json();
				if (!mounted) return;
				setLoggedIn(Boolean(json?.loggedIn));
				setPages(Array.isArray(json?.pages) ? json.pages : []);
			} catch {
				// noop
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<main className="mx-auto max-w-3xl px-6 py-10">
			<OnboardingProgress />
			<section className="mt-6">
				<h1 className="text-2xl font-semibold">Instagram 連携</h1>
				<p className="mt-2 text-muted-foreground">
					投稿の読み取りのみを行います。決済情報やパスワードにはアクセスしません。
				</p>
				<div className="mt-6">
					{!loggedIn ? (
						<ConnectInstagramButton />
					) : loading ? (
						<p className="text-sm text-muted-foreground">接続アカウントを確認中...</p>
					) : pages.length === 0 ? (
						<div className="text-sm text-muted-foreground">
							Instagramと連携されたFacebookページが見つかりません。
							<br />
							ページとInstagramプロアカウントの連携をご確認ください。
						</div>
					) : (
						<div className="space-y-4">
							<div className="text-sm">連携するアカウントを選択してください。</div>
							<div className="space-y-2">
								{pages.map((p) => (
									<label key={p.pageId} className="flex items-center gap-2 rounded border p-2">
										<input
											type="radio"
											name="page"
											value={p.igUserId ?? ""}
											checked={selected === (p.igUserId ?? "")}
											onChange={() => setSelected(p.igUserId ?? "")}
										/>
										<span className="text-sm">
											{p.igUsername ?? "(ユーザー名不明)"}{" "}
											<span className="text-muted-foreground">/ {p.pageName ?? "ページ名不明"}</span>
										</span>
									</label>
								))}
							</div>
							<div>
								<Button
									type="button"
									disabled={!selected}
									onClick={async () => {
										if (!selected) return;
										await fetch("/api/instagram/link", {
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({
												igUserId: selected,
												igUsername: pages.find((p) => p.igUserId === selected)?.igUsername ?? null,
											}),
										});
										location.href = "/onboarding/step2";
									}}
								>
									このアカウントで連携する
								</Button>
							</div>
						</div>
					)}
				</div>
				<div className="mt-8">
					<Link href="/onboarding/step2">
						<Button variant="ghost" className="text-sm underline">
							すでに連携済み → 次へ
						</Button>
					</Link>
				</div>
			</section>
		</main>
	);
}


