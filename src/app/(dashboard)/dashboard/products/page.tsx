import { ConnectInstagramButton } from "@/components/connect-instagram-button";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { syncInstagramPosts } from "@/lib/actions/product";
import { InstagramDiagnoseCard } from "@/components/instagram-diagnose-card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { updateProductAdmin } from "@/lib/actions/product-admin";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

function formatPrice(value: number) {
	return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(value);
}

export default async function ProductsPage({ searchParams }: { searchParams?: { updated?: string } }) {
	const supabase = createServerComponentClient({ cookies });
	const { data } = await supabase.auth.getUser();
	let ownerId: string | null = null;
	if (data.user) {
		const owner = await prisma.user.findUnique({
			where: { authUserId: data.user.id },
			select: { id: true },
		});
		ownerId = owner?.id ?? null;
	}
	const products = await prisma.product.findMany({
		where: ownerId ? { userId: ownerId } : undefined,
		orderBy: { createdAt: "desc" },
	});

	async function syncAction() {
		"use server";
		await syncInstagramPosts();
	}

	return (
		<main className="mx-auto max-w-6xl">
			<PageHeader
				title="商品一覧"
				description="Instagramからの取り込みと在庫更新、公開設定を管理します。"
				actions={
					<div className="flex gap-2">
					<ConnectInstagramButton />
					<form
						action={async (formData) => {
							"use server";
							const maxItems = Number(formData.get("maxItems") || 50);
							const excludeVideo = formData.get("excludeVideo") === "on";
							await syncInstagramPosts(undefined, { maxItems, excludeVideo });
						}}
						className="flex items-center gap-2"
					>
						<input
							name="maxItems"
							type="number"
							min={1}
							max={100}
							defaultValue={50}
							className="w-20 rounded border bg-background px-2 py-1 text-sm"
						/>
						<label className="flex items-center gap-1 text-sm">
							<input type="checkbox" name="excludeVideo" /> 動画除外
						</label>
						<Button type="submit" variant="default">
							Instagram と同期する
						</Button>
					</form>
					</div>
				}
			/>
			{searchParams?.updated && (
				<div className="mb-3 rounded border bg-green-50 px-3 py-2 text-sm text-green-800">
					保存しました。
				</div>
			)}
			<div className="px-6">
				<InstagramDiagnoseCard />
			</div>
			<div className="mx-6 overflow-x-auto rounded-md border">
				<table className="w-full text-sm">
					<thead className="bg-muted/50">
						<tr className="[&>th]:px-3 [&>th]:py-2 text-left">
							<th>画像</th>
							<th>商品名</th>
							<th>価格</th>
							<th>在庫</th>
							<th>公開</th>
							<th />
							<th>ステータス</th>
							<th>作成日時</th>
						</tr>
					</thead>
					<tbody>
						{products.map((p: any) => (
							<tr key={p.id} className="border-t [&>td]:px-3 [&>td]:py-3">
								<td className="w-[80px]">
									{p.imageUrl ? (
										<img src={p.imageUrl} alt={p.title} loading="lazy" className="h-14 w-14 rounded object-cover" />
									) : (
										<div className="h-14 w-14 rounded bg-muted" />
									)}
								</td>
								<td className="max-w-[360px] truncate">{p.title}</td>
								<td>{formatPrice(p.price || 0)}</td>
								<td className="align-top">
									<Form>
										<form
											action={async (formData) => {
												"use server";
												const stock = Number(formData.get("stock") || 0);
												const id = String(formData.get("id"));
												await updateProductAdmin({ id, stock });
											}}
											className="flex items-end gap-2"
										>
											<input type="hidden" name="id" value={p.id} />
											<FormField
												name="stock"
												render={() => (
													<FormItem>
										<FormLabel className="text-xs">在庫</FormLabel>
														<FormControl>
															<Input name="stock" type="number" min={0} step={1} defaultValue={p.stock} className="w-24" />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<button className="rounded-md border px-2 py-1 text-xs hover:bg-accent">保存</button>
										</form>
									</Form>
								</td>
								<td className="align-top">
									<Form>
										<form
											action={async (formData) => {
												"use server";
												const id = String(formData.get("id"));
												const active = formData.get("is_active") === "on";
												await updateProductAdmin({ id, is_active: active });
											}}
											className="flex items-end gap-2"
										>
											<input type="hidden" name="id" value={p.id} />
											<FormField
												name="is_active"
												render={() => (
													<FormItem>
														<FormLabel className="text-xs">公開</FormLabel>
														<FormControl>
															<input type="checkbox" name="is_active" defaultChecked={p.is_active} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<button className="rounded-md border px-2 py-1 text-xs hover:bg-accent">更新</button>
										</form>
									</Form>
								</td>
								<td />
								<td>
									<span
										className={
											p.is_active
												? "rounded bg-green-100 px-2 py-0.5 text-xs text-green-800"
												: "rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
										}
									>
										{p.is_active ? "販売中" : "非公開"}
									</span>
								</td>
								<td>{new Date(p.createdAt).toLocaleString("ja-JP")}</td>
							</tr>
						))}
						{products.length === 0 && (
							<tr>
								<td colSpan={8} className="px-3 py-6">
									<EmptyState
										title="商品がありません"
										description="Instagram と連携して投稿を商品化できます。"
										actionHref="/dashboard/instagram/import"
										actionLabel="Instagramから選ぶ"
									/>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</main>
	);
}



