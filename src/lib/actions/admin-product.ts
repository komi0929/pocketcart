"use server";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getOwnerId() {
	const supabase = createServerComponentClient({ cookies });
	const { data } = await supabase.auth.getUser();
	if (!data.user) throw new Error("未認証です。");
	const owner = await prisma.user.upsert({
		where: { authUserId: data.user.id },
		create: { authUserId: data.user.id, email: data.user.email ?? null, name: data.user.user_metadata?.name ?? null },
		update: {},
	});
	return owner.id;
}

export async function listMyProducts() {
	const ownerId = await getOwnerId();
	return prisma.product.findMany({
		where: { userId: ownerId },
		orderBy: { createdAt: "desc" },
	});
}

export async function updateProductAdmin(input: { id: string; stock?: number; is_active?: boolean }) {
	const ownerId = await getOwnerId();
	const { id, stock, is_active } = input;
	await prisma.product.updateMany({
		where: { id, userId: ownerId },
		data: {
			...(typeof stock === "number" ? { stock } : {}),
			...(typeof is_active === "boolean" ? { is_active } : {}),
		},
	});
	revalidatePath("/dashboard/products");
}


