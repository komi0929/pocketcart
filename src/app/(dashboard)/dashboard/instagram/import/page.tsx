import { loadRecentMedia, importSelectedMedia } from "@/lib/actions/instagram-import";
import Image from "next/image";

export default async function InstagramImportPage() {
	const media = await loadRecentMedia(36);
	return (
		<main className="mx-auto max-w-6xl px-6 py-10">
			<h1 className="text-2xl font-semibold mb-4">Instagram 手動インポート</h1>
			<form
				action={async (formData) => {
					"use server";
					const ids = formData.getAll("mediaId") as string[];
					await importSelectedMedia(ids);
				}}
			>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{media.map((m) => (
						<label key={m.id} className="block cursor-pointer rounded border p-2 hover:shadow">
							<input type="checkbox" name="mediaId" value={m.id} className="mb-2" />{" "}
							<span className="text-xs text-muted-foreground">選択</span>
							<div className="mt-2">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={m.media_url} alt={m.caption ?? ""} className="h-36 w-full object-cover rounded" />
							</div>
							<p className="mt-2 line-clamp-2 text-xs">{m.caption}</p>
						</label>
					))}
				</div>
				<div className="mt-6">
					<button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground">
						選択した投稿を商品化
					</button>
				</div>
			</form>
		</main>
	);
}



