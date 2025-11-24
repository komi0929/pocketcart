import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export async function logEventWithAuth(type: string, path?: string, props?: any) {
	try {
		const supabase = createServerComponentClient({ cookies });
		const { data } = await supabase.auth.getUser();
		let userId: string | undefined = undefined;
		if (data.user) {
			const user = await prisma.user.findUnique({ where: { authUserId: data.user.id } });
			userId = user?.id;
		}
		await prisma.analyticsEvent.create({
			data: {
				type,
				path,
				props: props ? (props as any) : undefined,
				userId,
			},
		});
	} catch (e) {
		console.warn("logEventWithAuth error:", e);
	}
}

export async function logEventForUserId(userId: string | undefined, type: string, path?: string, props?: any) {
	try {
		await prisma.analyticsEvent.create({
			data: {
				type,
				path,
				props: props ? (props as any) : undefined,
				userId,
			},
		});
	} catch (e) {
		console.warn("logEventForUserId error:", e);
	}
}




