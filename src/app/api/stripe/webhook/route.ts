import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendMail } from "@/lib/email";
import { logEventForUserId } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
	const sig = request.headers.get("stripe-signature");
	if (!sig) {
		return NextResponse.json({ error: "Missing signature" }, { status: 400 });
	}
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!webhookSecret) {
		return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
	}
	const rawBody = await request.text();

	let event: any;
	try {
		event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
	} catch (err: any) {
		return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
	}

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as {
					id: string;
					payment_intent?: string;
					metadata?: Record<string, string>;
				};
				const orderId = session.metadata?.orderId;
				if (orderId) {
					await prisma.$transaction(async (tx: any) => {
						const order = await tx.order.update({
							where: { id: orderId },
							data: {
								status: "PAID",
								stripe_payment_intent_id: session.payment_intent ?? null,
							},
							include: { product: { select: { id: true, stock: true } } },
						});
						if (order?.product) {
							const newStock = Math.max(0, (order.product.stock ?? 0) - order.quantity);
							await tx.product.update({
								where: { id: order.product.id },
								data: {
									stock: newStock,
									is_active: newStock > 0,
								},
							});
						}
					});
					// オーナー通知
					const ord = await prisma.order.findUnique({
						where: { id: orderId },
						include: { product: { select: { title: true, userId: true } } },
					});
					if (ord?.product?.userId) {
						// 計測
						await logEventForUserId(ord.product.userId, "checkout_completed", "/api/stripe/webhook", {
							orderId: ord.id,
							amount_total: ord.amount_total,
						});
						const owner = await prisma.user.findUnique({
							where: { id: ord.product.userId },
							select: { email: true, shopName: true },
						});
						if (owner?.email) {
							const subject = `[pocketcart] 支払い完了 ${ord.product.title} x${ord.quantity}`;
							const text =
								`${owner.shopName ?? ""} 様\n\n` +
								`注文の支払いが完了しました。\n商品: ${ord.product.title}\n数量: ${ord.quantity}\n` +
								`合計: ${ord.amount_total}円\n管理画面: /dashboard/orders/${ord.id}\n`;
							await sendMail({ to: owner.email, subject, text });
						}
					}
				}
				break;
			}
			case "payment_intent.succeeded": {
				const pi = event.data.object as {
					id: string;
					metadata?: Record<string, string>;
				};
				const orderId = pi.metadata?.orderId;
				if (orderId) {
					await prisma.$transaction(async (tx: any) => {
						const order = await tx.order.update({
							where: { id: orderId },
							data: {
								status: "PAID",
								stripe_payment_intent_id: pi.id,
							},
							include: { product: { select: { id: true, stock: true } } },
						});
						if (order?.product) {
							const newStock = Math.max(0, (order.product.stock ?? 0) - order.quantity);
							await tx.product.update({
								where: { id: order.product.id },
								data: {
									stock: newStock,
									is_active: newStock > 0,
								},
							});
						}
					});
					// オーナー通知
					const ord = await prisma.order.findUnique({
						where: { id: orderId },
						include: { product: { select: { title: true, userId: true } } },
					});
					if (ord?.product?.userId) {
						await logEventForUserId(ord.product.userId, "checkout_completed", "/api/stripe/webhook", {
							orderId: ord.id,
							amount_total: ord.amount_total,
						});
						const owner = await prisma.user.findUnique({
							where: { id: ord.product.userId },
							select: { email: true, shopName: true },
						});
						if (owner?.email) {
								const subject = `[pocketcart] 支払い完了 ${ord.product.title} x${ord.quantity}`;
							const text =
								`${owner.shopName ?? ""} 様\n\n` +
								`注文の支払いが完了しました。\n商品: ${ord.product.title}\n数量: ${ord.quantity}\n` +
								`合計: ${ord.amount_total}円\n管理画面: /dashboard/orders/${ord.id}\n`;
							await sendMail({ to: owner.email, subject, text });
						}
					}
				}
				break;
			}
			case "payment_intent.payment_failed": {
				const pi = event.data.object as {
					id: string;
					metadata?: Record<string, string>;
				};
				const orderId = pi.metadata?.orderId;
				if (orderId) {
					await prisma.order.update({
						where: { id: orderId },
						data: {
							status: "CANCELLED",
							stripe_payment_intent_id: pi.id,
						},
					});
				}
				break;
			}
			default:
				// no-op for other events
				break;
		}
	} catch (e: any) {
		return NextResponse.json({ error: e.message ?? "Unhandled error" }, { status: 500 });
	}

	return NextResponse.json({ received: true });
}


