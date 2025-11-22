"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { computeShippingCost } from "@/lib/shipping";
import { REGION_LABELS, type RegionKey } from "@/lib/regions";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/lib/email";
import { logEventForUserId } from "@/lib/analytics";

export async function createCheckoutSession(params: {
	productId: string;
	quantity: number;
	region: RegionKey;
	origin?: string;
}) {
	const { productId, quantity, region, origin } = params;
	if (!productId || quantity <= 0) {
		throw new Error("不正な入力です。");
	}
	const product = await prisma.product.findUnique({
		where: { id: productId },
		select: {
			id: true,
			userId: true,
			title: true,
			imageUrl: true,
			price: true,
			requires_cool: true,
			stock: true,
		},
	});
	if (!product) throw new Error("商品が見つかりません。");
	if (product.stock <= 0 || product.stock < quantity) {
		throw new Error("在庫が不足しています。");
	}
	const rule = await prisma.shippingRule.findUnique({
		where: { userId: product.userId },
	});
	if (!rule) {
		throw new Error("送料設定が未登録です。");
	}
	const shippingCost = computeShippingCost(rule, region, product.requires_cool);
	const amountItems = product.price * quantity;
	const amountTotal = amountItems + shippingCost;

	// 注文レコード（PENDING）
	const order = await prisma.order.create({
		data: {
			userId: product.userId,
			productId: product.id,
			quantity,
			shipping_cost: shippingCost,
			shipping_address_region: REGION_LABELS[region],
			amount_total: amountTotal,
			status: "PENDING",
		},
	});

	// 計測: Checkout開始
	await logEventForUserId(product.userId, "checkout_started", "/products/[id]", {
		productId: product.id,
		quantity,
		amount_total: amountTotal,
	});

	// 店舗オーナー通知（支払い前）
	try {
		const owner = await prisma.user.findUnique({
			where: { id: product.userId },
			select: { email: true, shopName: true },
		});
		if (owner?.email) {
			const subject = `[pocketcart] 新規注文（仮受付） ${product.title} x${quantity}`;
			const text =
				`${owner.shopName ?? ""} 様\n\n` +
				`新しい注文が作成されました（支払い未確定）。\n` +
				`商品: ${product.title}\n数量: ${quantity}\n地域: ${REGION_LABELS[region]}\n` +
				`小計: ${amountItems}円 / 送料: ${shippingCost}円 / 合計: ${amountTotal}円\n` +
				`管理画面: /dashboard/orders\n`;
			await sendMail({ to: owner.email, subject, text });
		}
	} catch {}

	// Stripe Checkout セッション
	const success = (origin ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000") +
		`/checkout/success?orderId=${order.id}`;
	const cancel = (origin ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000") +
		`/checkout/cancel?orderId=${order.id}`;

	const session = await stripe.checkout.sessions.create({
		mode: "payment",
		payment_method_types: ["card"],
		payment_intent_data: {
			metadata: {
				orderId: "", // 後で上書き（Checkout APIの仕様上ここにも付与しておく）
				productId: product.id,
			},
		},
		line_items: [
			{
				quantity,
				price_data: {
					currency: "jpy",
					unit_amount: product.price, // JPY はゼロ小数
					product_data: {
						name: product.title,
						images: product.imageUrl ? [product.imageUrl] : [],
					},
				},
			},
			{
				quantity: 1,
				price_data: {
					currency: "jpy",
					unit_amount: shippingCost,
					product_data: {
						name: "送料",
					},
				},
			},
		],
		success_url: success,
		cancel_url: cancel,
		metadata: {
			orderId: order.id,
			productId: product.id,
		},
	});

	// ここでは payment_intent_id は未確定のため保持しない。Webhooksで更新予定。

	revalidatePath("/(shop)");
	return { checkoutUrl: session.url as string, orderId: order.id };
}


