import { prisma } from "@/lib/prisma";
import { markOrderShipped } from "@/lib/actions/order-admin";

type Props = { params: { id: string } };

function formatJPY(n: number) {
	return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
}

export default async function OrderDetailPage({
	params,
	searchParams,
}: Props & { searchParams?: { shipped?: string } }) {
	const order = await prisma.order.findUnique({
		where: { id: params.id },
		include: {
			product: { select: { title: true, imageUrl: true } },
			user: { select: { name: true } },
		},
	});
	if (!order) {
		return <main className="mx-auto max-w-4xl px-6 py-10">注文が見つかりません。</main>;
	}

	return (
		<main className="mx-auto max-w-4xl px-6 py-10">
			<h1 className="text-2xl font-semibold mb-4">注文詳細</h1>
			{searchParams?.shipped && (
				<div className="mb-3 rounded border bg-green-50 px-3 py-2 text-sm text-green-800">
					出荷状態を更新しました。
				</div>
			)}
			<div className="rounded border p-4">
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
					<p>注文ID</p>
					<p>{order.id}</p>
					<p>地域</p>
					<p>{order.shipping_address_region}</p>
					<p>送料</p>
					<p>{formatJPY(order.shipping_cost)}</p>
					<p>合計</p>
					<p className="font-medium">{formatJPY(order.amount_total)}</p>
					<p>ステータス</p>
					<p>{order.status}</p>
					<p>追跡番号</p>
					<p>{order.tracking_number ?? "-"}</p>
					<p>出荷日時</p>
					<p>{order.shipped_at ? new Date(order.shipped_at).toLocaleString("ja-JP") : "-"}</p>
				</div>
			</div>

			<div className="mt-6 rounded border p-4">
				<h2 className="font-medium">発送処理</h2>
				<form
					action={async (formData) => {
						"use server";
						await markOrderShipped({
							id: order.id,
							tracking_number: (formData.get("tracking_number") as string) || undefined,
						});
					}}
					className="mt-3 flex items-center gap-2"
				>
					<input
						name="tracking_number"
						placeholder="追跡番号（任意）"
						defaultValue={order.tracking_number ?? ""}
						className="w-64 rounded border bg-background px-3 py-2"
					/>
					<button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
						出荷済みに更新
					</button>
				</form>
			</div>
		</main>
	);
}


