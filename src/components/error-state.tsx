"use client";

type Props = {
	title?: string;
	message?: string;
};

export function ErrorState({ title = "エラーが発生しました", message }: Props) {
	return (
		<div className="rounded border border-red-300 bg-red-50 p-6">
			<p className="font-medium text-red-700">{title}</p>
			{message && <p className="mt-1 text-sm text-red-600">{message}</p>}
		</div>
	);
}




