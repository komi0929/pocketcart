import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
	const products = await prisma.product.findMany({
		where: { is_active: true },
		select: { id: true, updatedAt: true },
	});
	return [
		{ url: `${base}/`, lastModified: new Date() },
		{ url: `${base}/products`, lastModified: new Date() },
		...products.map((p) => ({
			url: `${base}/products/${p.id}`,
			lastModified: p.updatedAt,
		})),
	];
}



