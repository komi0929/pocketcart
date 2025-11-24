import { PrismaClient } from "@prisma/client";

declare global {
	var prismaGlobal: PrismaClient | undefined;
}

function getPrismaClient(): PrismaClient {
	if (!global.prismaGlobal) {
		global.prismaGlobal = new PrismaClient({
			log: ["warn", "error"],
		});
	}
	return global.prismaGlobal;
}

export const prisma = new Proxy({} as PrismaClient, {
	get(_target, prop) {
		// アクセスされたタイミングで初期化（ビルド時のモジュール評価では生成しない）
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (getPrismaClient() as any)[prop as keyof PrismaClient];
	},
});



