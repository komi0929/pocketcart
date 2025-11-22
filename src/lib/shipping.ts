// 型がなくても動作するように最低限の構造を記述
type RuleShape = Record<
	| "hokkaido"
	| "tohoku"
	| "kanto"
	| "chubu"
	| "kinki"
	| "chugoku"
	| "shikoku"
	| "kyushu"
	| "okinawa"
	| "cool_fee",
	number
>;
import type { RegionKey } from "@/lib/regions";

export function computeShippingCost(
	rule: RuleShape,
	region: RegionKey,
	requiresCool: boolean,
): number {
	const base = rule[region] as unknown as number;
	const addCool = requiresCool ? rule.cool_fee : 0;
	return base + addCool;
}


