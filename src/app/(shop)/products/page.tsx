import { prisma } from "@/lib/prisma";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";

type Props = { searchParams?: { q?: string; page?: string; pageSize?: string } };

export default async function ProductsListPage({ searchParams }: Props) {
	const q = searchParams?.q?.trim() ?? "";
	const page = Math.max(1, Number(searchParams?.page ?? 1));
	const pageSize = Math.min(48, Math.max(6, Number(searchParams?.pageSize ?? 12)));
	const orFilters: Prisma.ProductWhereInput[] = q
		? [
				{ title: { contains: q, mode: "insensitive" as Prisma.QueryMode } },
				{ description: { contains: q, mode: "insensitive" as Prisma.QueryMode } },
		  ]
		: [];
	const where: Prisma.ProductWhereInput = {
		is_active: true,
		...(orFilters.length ? { OR: orFilters } : {}),
	};
	const [total, products] = await Promise.all([
		prisma.product.count({ where }),
		prisma.product.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
	]);
	return (
		<main className="mx-auto max-w-6xl px-6 py-10">
			<h1 className="text-2xl font-semibold mb-4">商品一覧</h1>
			<form className="mb-6 flex items-center gap-2">
				<input
					name="q"
					placeholder="商品名で検索"
					defaultValue={q}
					className="w-64 rounded border bg-background px-3 py-2"
				/>
				<button type="submit" className="rounded border px-3 py-2">
					検索
				</button>
			</form>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{products.map((p: any) => (
					<Link
						key={p.id}
						href={`/products/${p.id}`}
						className="rounded border p-4 hover:shadow"
					>
						<div className="aspect-square w-full overflow-hidden rounded bg-muted">
							{p.imageUrl ? (
								<img
									src={p.imageUrl}
									alt={p.title}
									loading="lazy"
									className="h-full w-full object-cover"
								/>
							) : null}
						</div>
						<div className="mt-3">
							<p className="font-medium">{p.title}</p>
							<p className="text-sm text-muted-foreground">{new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(p.price)}</p>
						</div>
					</Link>
				))}
				{products.length === 0 && (
					<EmptyState title="販売中の商品がありません" description="現在、公開されている商品はありません。後ほど再度ご確認ください。" />
				)}
			</div>
			<Pagination page={page} pageSize={pageSize} total={total} />
		</main>
	);
}


