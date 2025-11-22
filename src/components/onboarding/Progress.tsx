"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
	{ num: 1, label: "アカウント入力", href: "/onboarding/step1" },
	{ num: 2, label: "投稿プレビュー", href: "/onboarding/step2" },
	{ num: 3, label: "連携", href: "/onboarding/step3" },
	{ num: 4, label: "初期設定", href: "/onboarding/step4" },
	{ num: 5, label: "商品選択", href: "/onboarding/step5" },
];

export function OnboardingProgress() {
	const path = usePathname();
	return (
		<div className="mx-auto max-w-3xl px-6 pt-6">
			<nav className="flex flex-wrap gap-2 text-sm">
				{steps.map((s) => {
					const active = path?.startsWith(`/onboarding/step${s.num}`);
					return (
						<Link
							key={s.num}
							href={s.href}
							className={
								"rounded border px-3 py-1 " +
								(active ? "bg-primary text-primary-foreground" : "hover:bg-muted")
							}
						>
							<span className="mr-1">STEP{s.num}</span>
							{s.label}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}



