import { OnboardingProgress } from "@/components/onboarding/Progress";
import Link from "next/link";

type Props = { searchParams?: { username?: string } };

export default function Step2({ searchParams }: Props) {
	const username = searchParams?.username ?? "your_account";
	return (
		<main className="mx-auto max-w-4xl px-6 py-10">
			<OnboardingProgress />
			<section className="mt-6">
				<h1 className="text-2xl font-semibold">@{username} の投稿プレビュー</h1>
				<p className="mt-2 text-muted-foreground">
					実際の投稿に近いダミー表示です。連携後は本物の投稿がここに表示されます。
				</p>
				<div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{Array.from({ length: 12 }).map((_, i) => (
						<div key={i} className="h-36 w-full rounded bg-muted" />
					))}
				</div>
				<div className="mt-8 flex gap-3">
					<Link href="/onboarding/step1" className="rounded border px-4 py-2">
						戻る
					</Link>
					<Link href="/onboarding/step3" className="rounded bg-primary px-4 py-2 text-primary-foreground">
						無料ではじめる（連携へ）
					</Link>
				</div>
			</section>
		</main>
	);
}




