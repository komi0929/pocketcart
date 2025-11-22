import { OnboardingProgress } from "@/components/onboarding/Progress";
import { ConnectInstagramButton } from "@/components/connect-instagram-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Step3() {
	return (
		<main className="mx-auto max-w-3xl px-6 py-10">
			<OnboardingProgress />
			<section className="mt-6">
				<h1 className="text-2xl font-semibold">Instagram 連携</h1>
				<p className="mt-2 text-muted-foreground">
					投稿の読み取りのみを行います。決済情報やパスワードにはアクセスしません。
				</p>
				<div className="mt-6">
					<ConnectInstagramButton />
				</div>
				<div className="mt-8">
					<Link href="/onboarding/step4">
						<Button variant="ghost" className="text-sm underline">すでに連携済み → 次へ</Button>
					</Link>
				</div>
			</section>
		</main>
	);
}



