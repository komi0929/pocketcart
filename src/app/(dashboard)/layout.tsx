import Link from "next/link";
import { Suspense } from "react";
import { BRAND_LOGO_PATH, APP_NAME } from "@/lib/brand";
import { ToastOnQuery } from "@/components/toast-on-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<div>
			<Suspense fallback={null}>
				<ToastOnQuery />
			</Suspense>
			<header className="border-b">
				<nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
					<Link href="/dashboard/products" className="flex items-center gap-2 font-semibold">
						<img src={BRAND_LOGO_PATH} alt={APP_NAME} className="h-6 w-6 rounded" />
						<span>{APP_NAME} ダッシュボード</span>
					</Link>
					<div className="flex items-center gap-4 text-sm">
						<Link href="/dashboard/products" className="hover:underline">
							商品
						</Link>
						<Link href="/dashboard/instagram/import" className="hover:underline">
							Instagram取込
						</Link>
						<Link href="/dashboard/orders" className="hover:underline">
							注文
						</Link>
						<Link href="/dashboard/settings" className="hover:underline">
							設定
						</Link>
						<a href="/auth/sign-out" className="hover:underline">
							ログアウト
						</a>
					</div>
				</nav>
			</header>
			{children}
		</div>
	);
}


