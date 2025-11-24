"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Props = {
	page: number;
	pageSize: number;
	total: number;
};

export function Pagination({ page, pageSize, total }: Props) {
	const router = useRouter();
	const params = useSearchParams();
	const pathname = usePathname();
	const pageCount = Math.max(1, Math.ceil(total / pageSize));

	function go(to: number) {
		const p = new URLSearchParams(params);
		p.set("page", String(to));
		router.replace(`${pathname}?${p.toString()}`);
	}

	return (
		<div className="mt-6 flex items-center justify-center gap-2">
			<button
				disabled={page <= 1}
				onClick={() => go(page - 1)}
				className="rounded border px-3 py-1 text-sm disabled:opacity-50"
			>
				前へ
			</button>
			<span className="text-sm text-muted-foreground">
				{page} / {pageCount}
			</span>
			<button
				disabled={page >= pageCount}
				onClick={() => go(page + 1)}
				className="rounded border px-3 py-1 text-sm disabled:opacity-50"
			>
				次へ
			</button>
		</div>
	);
}




