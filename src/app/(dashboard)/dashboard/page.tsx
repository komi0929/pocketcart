import { prisma } from "@/lib/prisma";
import type { Order } from "@prisma/client";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardHome() {
  const since = startOfToday();

  const [ordersToday, paidAgg, checkoutStarted, checkoutCompleted, onboardingCompleted, recentOrders] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.order.aggregate({
        _sum: { amount_total: true },
        where: { status: "PAID", createdAt: { gte: since } },
      }),
      prisma.analytics.readonly?.count
        ? prisma.analytics.readonly.count({}) // placeholder when no access
        : prisma.analyticsEvent.count({ where: { type: "checkout_started", createdAt: { gte: since } } }),
      prisma.analyticsEvent.count({ where: { type: "checkout_completed", createdAt: { gte: since } } }),
      prisma.analyticsEvent.count({ where: { type: "onboarding_completed", createdAt: { gte: since } } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { product: { select: { title: true } } },
      }),
    ]);

  const revenueToday = paidAgg._sum.amount_total ?? 0;
  const conversion =
    checkoutStarted > 0 ? Math.round((checkoutCompleted / checkoutStarted) * 100) : 0;

  return (
    <main className="mx-auto max-w-6xl">
      <PageHeader
        title="ダッシュボード"
        description="本日の指標と直近の注文状況を確認できます。"
      />

      <section className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">本日の受注</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{ordersToday}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">本日の売上(決済済)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {new Intl.NumberFormat("ja-JP").format(revenueToday)}円
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">チェックアウト到達</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{checkoutStarted}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              本日のCVR（完了/到達）
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{conversion}%</CardContent>
        </Card>
      </section>

      <section className="px-6">
        <Card>
          <CardHeader>
            <CardTitle>直近の注文（5件）</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">まだ注文はありません。</p>
            ) : (
              <div className="divide-y">
                {recentOrders.map((o: Order & { product?: { title: string } | null }) => (
                  <div key={o.id} className="py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {o.product?.title ?? "商品"} × {o.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString("ja-JP")} ・{" "}
                        {o.shipping_address_region}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Intl.NumberFormat("ja-JP").format(o.amount_total)}円
                      </div>
                      <div className="text-xs text-muted-foreground">{o.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}


