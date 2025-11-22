import { prisma } from "@/lib/prisma";
import { REGION_LABELS, type RegionKey, PREFECTURES, prefectureToRegion } from "@/lib/regions";
import { computeShippingCost } from "@/lib/shipping";
import { createCheckoutSession } from "@/lib/actions/order";
import { redirect } from "next/navigation";
import { RegionSelector } from "@/components/region-selector";

type Props = { params: { id: string } };

export default async function ProductDetailPage({ params }: Props) {
	const product = await prisma.product.findUnique({
		where: { id: params.id },
		include: { user: { select: { id: true, shippingRule: true } } },
	});
	if (!product || !product.is_active) {
		return <main className="mx-auto max-w-3xl px-6 py-10">商品が見つかりません。</main>;
	}
	const rule = product.user.shippingRule;
	return (
		<main className="mx-auto max-w-3xl px-6 py-10">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				{product.imageUrl ? (
					<img
						src={product.imageUrl}
						alt={product.title}
						loading="lazy"
						className="h-80 w-full rounded object-cover"
						sizes="(min-width: 640px) 50vw, 100vw"
					/>
				) : (
					<div className="h-80 w-full rounded bg-muted" />
				)}
				<div>
					<h1 className="text-2xl font-semibold">{product.title}</h1>
					<p className="mt-2 text-muted-foreground whitespace-pre-wrap">{product.description}</p>
					<p className="mt-3 text-lg font-medium">
						{new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(product.price)}
					</p>
					<p className="mt-2 text-sm">在庫: {product.stock}</p>
					{product.stock > 0 && product.stock <= 3 && (
						<p className="mt-1 text-sm text-red-600">残りわずかです。お早めに。</p>
					)}
					{rule && product.stock > 0 ? (
						<form
							action={async (formData) => {
								"use server";
								const qty = Number(formData.get("quantity") || 1);
								const region = (formData.get("region") as RegionKey) ?? "kanto";
								const origin = (formData.get("origin") as string) || undefined;
								const { checkoutUrl } = await createCheckoutSession({
									productId: product.id,
									quantity: qty,
									region,
									origin,
								});
								redirect(checkoutUrl);
							}}
							className="mt-6 space-y-4"
						>
							<input type="hidden" name="origin" value={process.env.NEXT_PUBLIC_BASE_URL ?? ""} />
							<RegionSelector rule={rule} requiresCool={product.requires_cool} name="region" />
							<div className="space-y-1">
								<label className="block text-sm text-muted-foreground">数量</label>
								<input
									type="number"
									name="quantity"
									min={1}
									max={product.stock}
									defaultValue={Math.min(1, Math.max(0, product.stock))}
									className="w-32 rounded border bg-background px-3 py-2"
								/>
							</div>
							<button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
								購入に進む
							</button>
							<ul className="mt-3 space-y-1 text-xs text-muted-foreground">
								<li>・会員登録不要のゲスト購入（Stripe）</li>
								<li>・主要クレジットカード対応 / 安全なSSL決済</li>
								<li>・お届け目安: ご注文後2〜5営業日（目安）</li>
							</ul>
							{rule && (
								<p className="text-xs text-muted-foreground">
									参考送料（関東）: {computeShippingCost(rule, "kanto", product.requires_cool)} 円
									{product.requires_cool && "（クール便込）"}
								</p>
							)}
						</form>
					) : (
						<p className="mt-4 text-sm text-red-600">
							{!rule ? "この店舗の送料設定が未登録です。" : "在庫切れのため購入できません。"}
						</p>
					)}
				</div>
			</div>
		</main>
	);
}


