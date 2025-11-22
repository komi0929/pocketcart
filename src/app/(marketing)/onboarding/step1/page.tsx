import { OnboardingProgress } from "@/components/onboarding/Progress";
import Link from "next/link";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function Step1() {
	return (
		<main className="mx-auto max-w-3xl px-6 py-10">
			<OnboardingProgress />
			<section className="mt-6">
				<h1 className="text-2xl font-semibold">pocketcart へようこそ</h1>
				<p className="mt-2 text-muted-foreground">
					Instagram の投稿がそのまま商品ページになります。まずは Instagram
					ユーザー名を入力してください。（公開情報のみを使用）
				</p>
				<Form>
					<form action="/onboarding/step2" method="get" className="mt-6 flex items-end gap-3">
						<FormField
							name="username"
							render={() => (
								<FormItem>
									<FormLabel className="text-sm">Instagramユーザー名</FormLabel>
									<FormControl>
										<div className="flex items-center gap-2">
											<span className="text-sm">@</span>
											<Input name="username" placeholder="your_account" required className="w-64" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<button className="rounded-md bg-primary px-5 py-2.5 text-primary-foreground shadow hover:opacity-90">
							確認
						</button>
					</form>
				</Form>
				<p className="mt-3 text-xs text-muted-foreground">
					送信により利用規約・プライバシーポリシーに同意したものとみなします。
				</p>
				<div className="mt-8">
					<Link href="/onboarding/step3" className="text-sm underline">
						飛ばして連携へ進む →
					</Link>
				</div>
			</section>
		</main>
	);
}


