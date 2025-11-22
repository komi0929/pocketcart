"use client";

import * as React from "react";
import { PREFECTURES, prefectureToRegion, REGION_LABELS, type RegionKey } from "@/lib/regions";
import { computeShippingCost } from "@/lib/shipping";

type Props = {
	rule: {
		hokkaido: number;
		tohoku: number;
		kanto: number;
		chubu: number;
		kinki: number;
		chugoku: number;
		shikoku: number;
		kyushu: number;
		okinawa: number;
		cool_fee: number;
	};
	requiresCool: boolean;
	name?: string; // hidden input name for region
};

export function RegionSelector({ rule, requiresCool, name = "region" }: Props) {
	const [pref, setPref] = React.useState<string>("東京都");
	const region = React.useMemo<RegionKey>(() => prefectureToRegion(pref), [pref]);
	const shipping = React.useMemo(
		() => computeShippingCost(rule, region, requiresCool),
		[rule, region, requiresCool],
	);

	return (
		<div className="space-y-2">
			<input type="hidden" name={name} value={region} />
			<div className="space-y-1">
				<label className="block text-sm text-muted-foreground">お届け先の都道府県</label>
				<select
					value={pref}
					onChange={(e) => setPref(e.target.value)}
					className="w-full rounded border bg-background px-3 py-2"
				>
					{PREFECTURES.map((p) => (
						<option key={p} value={p}>
							{p}
						</option>
					))}
				</select>
			</div>
			<p className="text-xs text-muted-foreground">
				地域: {REGION_LABELS[region]} / 送料見込み: {shipping}円
				{requiresCool && "（クール便込）"}
			</p>
		</div>
	);
}


