export default function LoadingProducts() {
	return (
		<main className="mx-auto max-w-6xl px-6 py-10">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 9 }).map((_, i) => (
					<div key={i} className="rounded border p-4">
						<div className="h-48 w-full animate-pulse rounded bg-muted" />
						<div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-muted" />
						<div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" />
					</div>
				))}
			</div>
		</main>
	);
}




