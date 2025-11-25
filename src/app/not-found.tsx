export default function NotFound() {
	return (
		<main className="mx-auto max-w-3xl px-6 py-20 text-center">
			<h1 className="text-2xl font-semibold">ページが見つかりません</h1>
			<p className="mt-2 text-muted-foreground">URL をご確認ください。</p>
			<div className="mt-6">
				<a href="/" className="rounded border px-4 py-2">
					トップへ戻る
				</a>
			</div>
		</main>
	);
}






