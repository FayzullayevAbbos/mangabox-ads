"use client";

import * as React from "react";
import { RiBillLine } from "@remixicon/react";

import {
  EmptyResult,
  LoadErrorState,
  TableSkeleton,
} from "@/components/dashboard/page-states";
import { TransactionStatusBadge } from "@/components/dashboard/transaction-status-badge";
import { getCampaignOrders, type AdOrder } from "@/lib/api/ads";
import { formatDateTime, formatSomAmount } from "@/lib/format";
import { useT } from "@/lib/i18n/provider";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: AdOrder[] };

export function CampaignOrders({ campaignId }: { campaignId: string }) {
  const t = useT("ads");
  const cols = t.sheet.orders.columns;
  const [state, setState] = React.useState<State>({ status: "loading" });

  const load = React.useCallback(() => {
    setState({ status: "loading" });
    return getCampaignOrders(campaignId)
      .then((rows) => setState({ status: "ready", rows }))
      .catch((err: unknown) =>
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "",
        }),
      );
  }, [campaignId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") return <TableSkeleton rows={2} />;
  if (state.status === "error") {
    return <LoadErrorState message={state.message} onRetry={load} />;
  }
  if (state.rows.length === 0) {
    return (
      <EmptyResult icon={RiBillLine} title={t.sheet.orders.empty} description=" " />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[36rem] text-[0.9375rem]">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="px-5 py-2.5 font-medium">{cols.date}</th>
            <th className="px-3 py-2.5 font-medium">{cols.provider}</th>
            <th className="px-3 py-2.5 text-right font-medium">{cols.amount}</th>
            <th className="px-5 py-2.5 font-medium">{cols.status}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {state.rows.map((order) => (
            <tr key={order.id}>
              <td className="px-5 py-3.5 text-sm whitespace-nowrap text-muted-foreground">
                {order.createdAt ? formatDateTime(order.createdAt) : "—"}
              </td>
              <td className="px-3 py-3.5 text-sm">
                <span className="capitalize">{order.provider}</span>
                {order.transId && (
                  <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                    {order.transId}
                  </span>
                )}
              </td>
              <td className="px-3 py-3.5 text-right font-mono font-medium whitespace-nowrap tabular-nums">
                {formatSomAmount(order.amount)}
              </td>
              <td className="px-5 py-3.5">
                <TransactionStatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
