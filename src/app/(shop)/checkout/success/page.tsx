import { prisma } from "@/lib/prisma";

type Props = { searchParams: { orderId?: string } };

export default async function SuccessPage({ searchParams }: Props) {
	const orderId = searchParams.orderId;
	const order = orderId
		? await prisma.order.findUnique({
				where: { id: orderId },
				include: { product: { select: { title: true, imageUrl: true } } },
		  })
		: null;

	return (
		<main className="mx-auto max-w-3xl px-6 py-12">
			<h1 className="text-2xl font-semibold">ご購入ありがとうございます</h1>
			{order ? (
				<div className="mt-6 rounded border p-4">
					<div className="flex items-center gap-3">
						{order.product?.imageUrl ? (
							<img
								src={order.product.imageUrl}
								alt={order.product.title}
								className="h-16 w-16 rounded object-cover"
							/>
						) : (
							<div className="h-16 w-16 rounded bg-muted" />
						)}
						<div>
							<p className="font-medium">{order.product?.title ?? "-"}</p>
							<p className="text-sm text-muted-foreground">数量: {order.quantity}</p>
						</div>
					</div>
					<div className="mt-4 grid grid-cols-2 gap-2 text-sm">
						<p>配送地域</p>
						<p>{order.shipping_address_region}</p>
						<p>送料</p>
						<p>{order.shipping_cost.toLocaleString("ja-JP")}円</p>
						<p>合計金額</p>
						<p className="font-medium">{order.amount_total.toLocaleString("ja-JP")}円</p>
						<p>ステータス</p>
						<p>{order.status}</p>
					</div>
				</div>
			) : (
				<p className="mt-2 text-muted-foreground">注文情報の取得に失敗しました。</p>
			)}
		</main>
	);
}


