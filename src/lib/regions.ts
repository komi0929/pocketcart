export type RegionKey =
	| "hokkaido"
	| "tohoku"
	| "kanto"
	| "chubu"
	| "kinki"
	| "chugoku"
	| "shikoku"
	| "kyushu"
	| "okinawa";

export const REGION_LABELS: Record<RegionKey, string> = {
	hokkaido: "北海道",
	tohoku: "東北",
	kanto: "関東",
	chubu: "中部",
	kinki: "近畿",
	chugoku: "中国",
	shikoku: "四国",
	kyushu: "九州",
	okinawa: "沖縄",
};

export const REGION_KEYS: RegionKey[] = Object.keys(REGION_LABELS) as RegionKey[];

// 都道府県 → 地方区分
const PREF_TO_REGION: Record<string, RegionKey> = {
	北海道: "hokkaido",
	青森県: "tohoku",
	岩手県: "tohoku",
	宮城県: "tohoku",
	秋田県: "tohoku",
	山形県: "tohoku",
	福島県: "tohoku",
	茨城県: "kanto",
	栃木県: "kanto",
	群馬県: "kanto",
	埼玉県: "kanto",
	千葉県: "kanto",
	東京都: "kanto",
	神奈川県: "kanto",
	新潟県: "chubu",
	富山県: "chubu",
	石川県: "chubu",
	福井県: "chubu",
	山梨県: "chubu",
	長野県: "chubu",
	岐阜県: "chubu",
	静岡県: "chubu",
	愛知県: "chubu",
	三重県: "kinki",
	滋賀県: "kinki",
	京都府: "kinki",
	大阪府: "kinki",
	兵庫県: "kinki",
	奈良県: "kinki",
	和歌山県: "kinki",
	鳥取県: "chugoku",
	島根県: "chugoku",
	岡山県: "chugoku",
	広島県: "chugoku",
	山口県: "chugoku",
	徳島県: "shikoku",
	香川県: "shikoku",
	愛媛県: "shikoku",
	高知県: "shikoku",
	福岡県: "kyushu",
	佐賀県: "kyushu",
	長崎県: "kyushu",
	熊本県: "kyushu",
	大分県: "kyushu",
	宮崎県: "kyushu",
	鹿児島県: "kyushu",
	沖縄県: "okinawa",
};

export const PREFECTURES = Object.keys(PREF_TO_REGION);

export function prefectureToRegion(prefecture: string): RegionKey {
	const key = prefecture.trim();
	return PREF_TO_REGION[key] ?? "kanto";
}


