"use client";

import Link from "next/link";

type Props = {
	title: string;
	description?: string;
	actionHref?: string;
	actionLabel?: string;
};

export function EmptyState({ title, description, actionHref, actionLabel }: Props) {
	return (
		<div className="flex flex-col items-center justify-center rounded border p-8 text-center">
			<h2 className="text-lg font-medium">{title}</h2>
			{description && <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>}
			{actionHref && actionLabel && (
				<Link href={actionHref} className="mt-4 rounded border px-4 py-2 text-sm">
					{actionLabel}
				</Link>
			)}
		</div>
	);
}




