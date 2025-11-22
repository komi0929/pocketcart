import { OnboardingProgress } from "@/components/onboarding/Progress";
import Link from "next/link";
import { saveInitialSettings } from "@/lib/actions/onboarding";

export default function Step4() {
	return (
		<main className="mx-auto max-w-3xl px-6 py-10">
			<OnboardingProgress />
			<section className="mt-6">
				<h1 className="text-2xl font-semibold">ショップ基本情報</h1>
				<form action={saveInitialSettings} className="mt-4 space-y-4">
					<div>
						<label className="block text-sm text-muted-foreground">ショップ名</label>
						<input name="shopName" required className="w-full rounded border bg-background px-3 py-2" />
					</div>
					<div>
						<label className="block text-sm text-muted-foreground">ショップURL</label>
						<div className="flex items-center gap-2">
							<span className="text-sm">insta-shop.com/</span>
							<input
								name="shopSlug"
								required
								className="w-48 rounded border bg-background px-3 py-2"
								placeholder="your-shop"
								pattern="[a-z0-9-]+"
							/>
						</div>
						<p className="mt-1 text-xs text-muted-foreground">半角英数字とハイフンのみ</p>
					</div>
					<div>
						<label className="block text-sm text-muted-foreground">配送料</label>
						<div className="mt-1 space-y-2 rounded border p-3">
							<label className="flex items-center gap-2">
								<input type="radio" name="shippingType" value="flat" defaultChecked />
								<span>全国一律</span>
								<input
									name="flatFee"
									type="number"
									className="ml-2 w-24 rounded border bg-background px-2 py-1"
									defaultValue={500}
								/>
								<span>円</span>
							</label>
							<label className="flex items-center gap-2">
								<input type="radio" name="shippingType" value="free" />
								<span>送料無料</span>
							</label>
						</div>
					</div>
					<div className="mt-6 flex gap-3">
						<Link href="/onboarding/step3" className="rounded border px-4 py-2">
							戻る
						</Link>
						<button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
						 今すぐ開店
						</button>
					</div>
				</form>
			</section>
		</main>
	);
}


