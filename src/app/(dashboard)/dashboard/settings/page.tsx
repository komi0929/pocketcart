"use client";

import * as React from "react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingRuleSchema, type ShippingRuleFormValues } from "@/lib/validations/shipping";
import { getShippingRule, updateShippingRule } from "@/lib/actions/shipping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const emptyDefaults: ShippingRuleFormValues = {
	hokkaido: 0,
	tohoku: 0,
	kanto: 0,
	chubu: 0,
	kinki: 0,
	chugoku: 0,
	shikoku: 0,
	kyushu: 0,
	okinawa: 0,
	cool_fee: 330,
};

export default function SettingsPage() {
	const [isPending, startTransition] = useTransition();
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState<string | null>(null);

	const form = useForm<ShippingRuleFormValues>({
		// Zod v4 と @hookform/resolvers の型整合性差異を回避
		// ランタイムは問題ないため resolver の型だけ緩和する
		resolver: zodResolver(shippingRuleSchema) as any,
		defaultValues: emptyDefaults,
		mode: "onSubmit",
	});

	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				const data = await getShippingRule();
				if (isMounted && data) {
					form.reset({
						hokkaido: data.hokkaido,
						tohoku: data.tohoku,
						kanto: data.kanto,
						chubu: data.chubu,
						kinki: data.kinki,
						chugoku: data.chugoku,
						shikoku: data.shikoku,
						kyushu: data.kyushu,
						okinawa: data.okinawa,
						cool_fee: data.cool_fee,
					});
				}
			} catch (e) {
				console.error(e);
			} finally {
				if (isMounted) setLoading(false);
			}
		})();
		return () => {
			isMounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function setYamatoKantoStandard() {
		// 例: 一般的な 60サイズ/関東発の目安（実運賃は契約や時期で変動します）
		const preset: ShippingRuleFormValues = {
			hokkaido: 1400,
			tohoku: 1100,
			kanto: 930,
			chubu: 1000,
			kinki: 1100,
			chugoku: 1200,
			shikoku: 1200,
			kyushu: 1400,
			okinawa: 1500,
			cool_fee: 330,
		};
		for (const [key, value] of Object.entries(preset) as [keyof ShippingRuleFormValues, number][]) {
			form.setValue(key, value, { shouldValidate: true, shouldDirty: true });
		}
	}

	const onSubmit = (values: ShippingRuleFormValues) => {
		setMessage(null);
		startTransition(async () => {
			try {
				await updateShippingRule(values);
				setMessage("送料設定を保存しました。");
			} catch (e) {
				console.error(e);
				setMessage("保存に失敗しました。");
			}
		});
	};

	return (
		<main className="mx-auto max-w-4xl">
			<PageHeader title="設定" description="地域別送料とクール便の手数料を設定します。" />
			<div className="px-6 py-6">
			<Card>
				<CardHeader>
					<CardTitle>送料設定</CardTitle>
					<CardDescription>各地域の送料は税込・円単位で入力してください。</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex gap-2">
						<Button type="button" variant="secondary" onClick={setYamatoKantoStandard}>
							ヤマト運輸（関東発）の標準運賃をセット
						</Button>
					</div>
					<Separator className="my-4" />
					{loading ? (
						<p className="text-sm text-muted-foreground">読み込み中...</p>
					) : (
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<FormField
									control={form.control}
									name="hokkaido"
									render={({ field }) => (
										<FormItem>
											<FormLabel>北海道</FormLabel>
											<FormControl>
												<Input type="number" inputMode="numeric" min={0} step={1} aria-label="北海道の送料" {...field} />
											</FormControl>
											<p className="text-xs text-muted-foreground">税込・円単位で入力</p>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="tohoku"
									render={({ field }) => (
										<FormItem>
											<FormLabel>東北</FormLabel>
											<FormControl>
												<Input type="number" inputMode="numeric" min={0} step={1} aria-label="東北の送料" {...field} />
											</FormControl>
											<p className="text-xs text-muted-foreground">税込・円単位で入力</p>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="kanto"
									render={({ field }) => (
										<FormItem>
											<FormLabel>関東</FormLabel>
											<FormControl>
												<Input type="number" inputMode="numeric" min={0} step={1} aria-label="関東の送料" {...field} />
											</FormControl>
											<p className="text-xs text-muted-foreground">税込・円単位で入力</p>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="chubu"
									render={({ field }) => (
										<FormItem>
											<FormLabel>中部</FormLabel>
											<FormControl>
												<Input type="number" inputMode="numeric" min={0} step={1} aria-label="中部の送料" {...field} />
											</FormControl>
											<p className="text-xs text-muted-foreground">税込・円単位で入力</p>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="kinki"
									render={({ field }) => (
										<FormItem>
											<FormLabel>近畿</FormLabel>
											<FormControl>
												<Input type="number" inputMode="numeric" min={0} step={1} aria-label="近畿の送料" {...field} />
											</FormControl>
											<p className="text-xs text-muted-foreground">税込・円単位で入力</p>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="chugoku"
									render={({ field }) => (
										<FormItem>
											<FormLabel>中国</FormLabel>
											<FormControl>
												<Input type="number" inputMode="numeric" min={0} step={1} aria-label="中国の送料" {...field} />
											</FormControl>
											<p className="text-xs text-muted-foreground">税込・円単位で入力</p>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="shikoku"
									render={({ field }) => (
										<FormItem>
											<FormLabel>四国</FormLabel>
											<FormControl>
												<Input type="number" inputMode="numeric" min={0} step={1} aria-label="四国の送料" {...field} />
											</FormControl>
											<p className="text-xs text-muted-foreground">税込・円単位で入力</p>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="kyushu"
									render={({ field }) => (
										<FormItem>
											<FormLabel>九州</FormLabel>
											<FormControl>
												<Input type="number" inputMode="numeric" min={0} step={1} aria-label="九州の送料" {...field} />
											</FormControl>
											<p className="text-xs text-muted-foreground">税込・円単位で入力</p>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="okinawa"
									render={({ field }) => (
										<FormItem>
											<FormLabel>沖縄</FormLabel>
											<FormControl>
												<Input type="number" inputMode="numeric" min={0} step={1} aria-label="沖縄の送料" {...field} />
											</FormControl>
											<p className="text-xs text-muted-foreground">税込・円単位で入力</p>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Separator className="col-span-full my-2" />
								<FormField
									control={form.control}
									name="cool_fee"
									render={({ field }) => (
										<FormItem className="col-span-full">
											<FormLabel>クール便手数料</FormLabel>
											<FormControl>
												<Input type="number" inputMode="numeric" min={0} step={1} aria-label="クール便手数料" {...field} />
											</FormControl>
											<p className="text-xs text-muted-foreground">冷蔵・冷凍配送時に加算する手数料（円）</p>
											<FormMessage />
										</FormItem>
									)}
								/>
								<CardFooter className="col-span-full flex items-center gap-3 p-0 pt-2">
									<Button type="submit" disabled={isPending}>
										{isPending ? "保存中..." : "保存"}
									</Button>
									{message && <span className="text-sm text-muted-foreground">{message}</span>}
								</CardFooter>
							</form>
						</Form>
					)}
				</CardContent>
			</Card>
			</div>
		</main>
	);
}



