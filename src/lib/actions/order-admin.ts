"use server";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function markOrderShipped(input: { id: string; tracking_number?: string }) {
	const supabase = createServerComponentClient({ cookies });
	const { data } = await supabase.auth.getUser();
	if (!data.user) throw new Error("未認証です。");

	const owner = await prisma.user.findUnique({
		where: { authUserId: data.user.id },
		select: { id: true },
	});
	if (!owner) throw new Error("オーナーが見つかりません。");

	const order = await prisma.order.findUnique({
		where: { id: input.id },
		select: { id: true, userId: true },
	});
	if (!order || order.userId !== owner.id) throw new Error("権限がありません。");

	await prisma.order.update({
		where: { id: input.id },
		data: {
			status: "SHIPPED",
			tracking_number: input.tracking_number,
			shipped_at: new Date(),
		},
	});

	revalidatePath("/dashboard/orders");
	revalidatePath(`/dashboard/orders/${input.id}`);
	redirect(`/dashboard/orders/${input.id}?shipped=1&toast=出荷状態を更新しました`);
}


