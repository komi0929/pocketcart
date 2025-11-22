import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import type { Order } from "@prisma/client";

export async function GET() {
	const supabase = createRouteHandlerClient({ cookies });
	const { data } = await supabase.auth.getUser();
	if (!data.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const owner = await prisma.user.findUnique({
		where: { authUserId: data.user.id },
		select: { id: true },
	});
	if (!owner) return NextResponse.json({ error: "owner not found" }, { status: 404 });

	const orders = await prisma.order.findMany({
		where: { userId: owner.id },
		include: { product: { select: { title: true } } },
		orderBy: { createdAt: "desc" },
	});

	const rows = [
		[
			"order_id",
			"product_title",
			"quantity",
			"region",
			"shipping_cost",
			"amount_total",
			"status",
			"tracking_number",
			"created_at",
			"shipped_at",
		],
		...orders.map((o: Order & { product?: { title: string } | null }) => [
			o.id,
			o.product?.title ?? "",
			o.quantity,
			o.shipping_address_region,
			o.shipping_cost,
			o.amount_total,
			o.status,
			o.tracking_number ?? "",
			o.createdAt.toISOString(),
			o.shipped_at ? o.shipped_at.toISOString() : "",
		]),
	];
	const csv = rows.map((r) => r.join(",")).join("\n");
	return new NextResponse(csv, {
		headers: {
			"content-type": "text/csv; charset=utf-8",
			"content-disposition": `attachment; filename="orders.csv"`,
		},
	});
}



