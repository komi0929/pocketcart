"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { diagnoseInstagram } from "@/lib/actions/debug";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function InstagramDiagnoseCard() {
	const [isPending, startTransition] = useTransition();
	const [output, setOutput] = useState<unknown | null>(null);

	const onRun = () => {
		startTransition(async () => {
			const res = await diagnoseInstagram();
			setOutput(res);
		});
	};

	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>接続診断</CardTitle>
				<CardDescription>ログイン状態・トークン・Graph API の疎通を確認します。</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<Button type="button" onClick={onRun} disabled={isPending}>
					{isPending ? "診断中..." : "診断を実行"}
				</Button>
				{output !== null && (
					<pre className="max-h-80 overflow-auto rounded bg-muted p-3 text-xs">
						{JSON.stringify(output, null, 2)}
					</pre>
				)}
			</CardContent>
		</Card>
	);
}


