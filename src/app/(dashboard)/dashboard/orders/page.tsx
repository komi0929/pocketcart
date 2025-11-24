import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
	const supabase = createServerComponentClient({ cookies });
	const { data } = await supabase.auth.getUser();
	if (!data.user) {
		return <PageHeader title="注文" description="サインインしてください。" />;
	}
	const userRow = await prisma.user.findUnique({
		where: { authUserId: data.user.id },
		select: { id: true },
	});
	const orders = await prisma.order.findMany({
		where: { userId: userRow?.id ?? "" },
		include: {
			product: { select: { title: true, imageUrl: true } },
		},
		orderBy: { createdAt: "desc" },
	});

	return (
		<main className="mx-auto max-w-6xl">
			<PageHeader title="注文一覧" description="最新の受注を確認し、発送処理を行います。" />
			<div className="mx-6 mt-6 mb-3 flex justify-end">
				<a
					href="/api/orders/export"
					className="rounded border px-3 py-2 text-sm hover:bg-muted"
				>
					CSVエクスポート
				</a>
			</div>
			<div className="mx-6 overflow-x-auto rounded border">
				<table className="w-full text-sm">
					<thead className="bg-muted/50">
						<tr className="[&>th]:px-3 [&>th]:py-2 text-left">
							<th>商品</th>
							<th>数量</th>
							<th>地域</th>
							<th>送料</th>
							<th>合計</th>
							<th>ステータス</th>
							<th>日時</th>
							<th>詳細</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((o: any) => (
							<tr key={o.id} className="border-t [&>td]:px-3 [&>td]:py-3">
								<td className="flex items-center gap-2">
									{o.product?.imageUrl ? (
										<img
											src={o.product.imageUrl}
											alt={o.product.title}
											loading="lazy"
											className="h-10 w-10 rounded object-cover"
										/>
									) : (
										<div className="h-10 w-10 rounded bg-muted" />
									)}
									<span className="truncate">{o.product?.title ?? "-"}</span>
								</td>
								<td>{o.quantity}</td>
								<td>{o.shipping_address_region}</td>
								<td>{o.shipping_cost.toLocaleString("ja-JP")}円</td>
								<td>{o.amount_total.toLocaleString("ja-JP")}円</td>
								<td>
									<span
										className={
											o.status === "PAID"
												? "rounded bg-green-100 px-2 py-0.5 text-xs text-green-800"
												: o.status === "PENDING"
												? "rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800"
												: "rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
										}
									>
										{o.status}
									</span>
								</td>
								<td>{new Date(o.createdAt).toLocaleString("ja-JP")}</td>
								<td>
									<a className="text-primary underline" href={`/dashboard/orders/${o.id}`}>
										開く
									</a>
								</td>
							</tr>
						))}
						{orders.length === 0 && (
							<tr>
								<td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
									注文はまだありません。
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			{/* モバイルカード表示 */}
			<div className="mx-6 mt-6 space-y-3 sm:hidden">
				{orders.map((o: any) => (
					<div key={`card-${o.id}`} className="rounded border p-3">
						<div className="flex items-center gap-2">
							{o.product?.imageUrl ? (
								<img
									src={o.product.imageUrl}
									alt={o.product.title}
									loading="lazy"
									className="h-12 w-12 rounded object-cover"
								/>
							) : (
								<div className="h-12 w-12 rounded bg-muted" />
							)}
							<div className="min-w-0">
								<p className="truncate text-sm font-medium">{o.product?.title ?? "-"}</p>
								<p className="text-xs text-muted-foreground">
									{new Date(o.createdAt).toLocaleString("ja-JP")}・{o.shipping_address_region}
								</p>
							</div>
						</div>
						<div className="mt-2 flex items-center justify-between text-sm">
							<p>
								数量 {o.quantity}・合計 {o.amount_total.toLocaleString("ja-JP")}円
							</p>
							<a className="text-primary underline" href={`/dashboard/orders/${o.id}`}>
								詳細
							</a>
						</div>
					</div>
				))}
			</div>
		</main>
	);
}


