import { OnboardingProgress } from "@/components/onboarding/Progress";
import Link from "next/link";

export default function Step2() {
	return (
		<main className="mx-auto max-w-4xl px-6 py-10">
			<OnboardingProgress />
			<section className="mt-6">
				<h1 className="text-2xl font-semibold">最初の商品を選択</h1>
				<p className="mt-2 text-muted-foreground">
					Instagram 連携済みの場合は、管理画面の「Instagram取込」から投稿を選んで商品化できます。
				</p>
				<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{Array.from({ length: 12 }).map((_, i) => (
						<div key={i} className="rounded border p-2">
							<div className="h-32 w-full rounded bg-muted" />
							<div className="mt-2 h-3 w-2/3 rounded bg-muted" />
						</div>
					))}
				</div>
				<div className="mt-8 flex gap-3">
					<Link href="/dashboard/instagram/import" className="rounded bg-primary px-4 py-2 text-primary-foreground">
						Instagramから選ぶ
					</Link>
					<Link href="/onboarding/step3" className="rounded border px-4 py-2">
						後で設定する
					</Link>
				</div>
			</section>
		</main>
	);
}





