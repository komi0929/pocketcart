import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
	return (
		<main className="mx-auto max-w-6xl px-6 py-24">
			<section className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-accent/30 px-6 py-16 text-center">
				<div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,theme(colors.primary/10),transparent_60%)]" />
				<p className="mx-auto inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
					簡単・高速に商品化
				</p>
				<h1 className="mt-4 text-5xl font-bold tracking-tight">
					pocketcart — Instagram投稿が <span className="text-primary">そのまま</span> お店になる
				</h1>
				<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
					Instagramの投稿をそのまま商品化。地域別送料とクール便に対応し、Stripeで決済まで完結。
				</p>
				<div className="mt-8 flex justify-center gap-3">
					<Link href="/onboarding/step1">
						<Button className="px-6 py-5 text-base shadow">無料ではじめる</Button>
					</Link>
					<Link href="/products">
						<Button variant="secondary" className="px-6 py-5 text-base">デモを見る</Button>
					</Link>
				</div>
			</section>
			<section className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
				<div className="rounded-lg border bg-card p-5">
					<h3 className="font-medium">地域別送料（8区分）</h3>
					<p className="mt-2 text-sm text-muted-foreground">食品ECで必要な国内8区分に対応。</p>
				</div>
				<div className="rounded-lg border bg-card p-5">
					<h3 className="font-medium">クール便対応</h3>
					<p className="mt-2 text-sm text-muted-foreground">商品ごとにクール便加算を自動適用。</p>
				</div>
				<div className="rounded-lg border bg-card p-5">
					<h3 className="font-medium">Stripe決済</h3>
					<p className="mt-2 text-sm text-muted-foreground">安全な決済で入金まで自動化。</p>
				</div>
			</section>
		</main>
	);
}



