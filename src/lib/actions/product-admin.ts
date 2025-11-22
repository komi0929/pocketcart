"use server";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProductAdmin(input: {
	id: string;
	title?: string;
	price?: number;
	stock?: number;
	is_active?: boolean;
	requires_cool?: boolean;
}) {
	const supabase = createServerComponentClient({ cookies });
	const { data } = await supabase.auth.getUser();
	if (!data.user) {
		throw new Error("未認証です。");
	}
	const owner = await prisma.user.findUnique({
		where: { authUserId: data.user.id },
		select: { id: true },
	});
	if (!owner) throw new Error("オーナーが見つかりません。");

	const product = await prisma.product.findUnique({
		where: { id: input.id },
		select: { id: true, userId: true },
	});
	if (!product || product.userId !== owner.id) {
		throw new Error("権限がありません。");
	}

	await prisma.product.update({
		where: { id: input.id },
		data: {
			title: input.title,
			price: typeof input.price === "number" ? input.price : undefined,
			stock: typeof input.stock === "number" ? input.stock : undefined,
			is_active: typeof input.is_active === "boolean" ? input.is_active : undefined,
			requires_cool: typeof input.requires_cool === "boolean" ? input.requires_cool : undefined,
		},
	});

	revalidatePath("/dashboard/products");
	redirect("/dashboard/products?updated=1&toast=保存しました");
}


