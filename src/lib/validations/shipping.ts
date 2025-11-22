import { z } from "zod";

// 8地方区分 + クール便手数料（すべて Int, 0以上）
const yenField = z
	.coerce.number({ required_error: "必須です" })
	.int("整数で入力してください")
	.min(0, { message: "0以上の数値を入力してください" });

export const shippingRuleSchema = z.object({
	hokkaido: yenField,
	tohoku: yenField,
	kanto: yenField,
	chubu: yenField,
	kinki: yenField,
	chugoku: yenField,
	shikoku: yenField,
	kyushu: yenField,
	okinawa: yenField,
	cool_fee: yenField,
});

export type ShippingRuleFormValues = z.infer<typeof shippingRuleSchema>;



