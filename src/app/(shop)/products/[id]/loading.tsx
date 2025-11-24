export default function LoadingProductDetail() {
	return (
		<main className="mx-auto max-w-3xl px-6 py-10">
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				<div className="h-80 w-full animate-pulse rounded bg-muted" />
				<div>
					<div className="h-6 w-64 animate-pulse rounded bg-muted" />
					<div className="mt-2 h-4 w-80 animate-pulse rounded bg-muted" />
					<div className="mt-4 h-6 w-32 animate-pulse rounded bg-muted" />
					<div className="mt-6 h-10 w-48 animate-pulse rounded bg-muted" />
				</div>
			</div>
		</main>
	);
}




