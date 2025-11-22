// キャプションから価格を抽出。最初に見つかった価格を返す
export function parsePriceFromCaption(caption?: string | null): number | null {
	if (!caption) return null;

	// バリエーション:
	// - ¥1,000 / ￥1000 / 1000円 / 1,000 / １０００円（全角の円記号には未対応だが基本ケースを網羅）
	const patterns: RegExp[] = [
		/[¥￥]\s*([0-9]{1,3}(?:[, ]?[0-9]{3})+|[0-9]{3,})/, // ¥1,000 / ￥1000
		/([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,})\s*円/, // 1,000円 / 1000円
		/\b([0-9]{1,3}(?:,[0-9]{3})+)\b/, // 1,000
	];

	for (const regex of patterns) {
		const m = caption.match(regex);
		if (m && m[1]) {
			const normalized = m[1].replace(/[, ]/g, "");
			const value = Number.parseInt(normalized, 10);
			if (Number.isFinite(value)) {
				return value;
			}
		}
	}

	return null;
}



