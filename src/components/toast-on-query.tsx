"use client";

import * as React from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export function ToastOnQuery() {
	const search = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [message, setMessage] = React.useState<string>("");

	React.useEffect(() => {
		const t = search.get("toast");
		const updated = search.get("updated");
		const shipped = search.get("shipped");
		const m =
			t ?? ((updated ? "保存しました。" : "") || (shipped ? "出荷状態を更新しました。" : ""));
		if (m) {
			setMessage(m);
			setOpen(true);
		}
	}, [search]);

	if (!open || !message) return null;

	return (
		<div className="fixed inset-x-0 top-3 z-50 flex justify-center px-3">
			<div className="flex items-center gap-3 rounded border bg-background px-4 py-2 shadow">
				<p className="text-sm">{message}</p>
				<button
					className="text-xs text-muted-foreground hover:underline"
					onClick={() => {
						setOpen(false);
						// クエリを消す
						const params = new URLSearchParams(Array.from(search.entries()));
						params.delete("toast");
						params.delete("updated");
						params.delete("shipped");
						router.replace(`${pathname}?${params.toString()}`, { scroll: false });
					}}
				>
					閉じる
				</button>
			</div>
		</div>
	);
}



