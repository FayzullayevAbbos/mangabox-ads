"use client";

import * as React from "react";
import { RiBillLine } from "@remixicon/react";

import { PageHeader } from "@/components/dashboard/page-header";
import {
  EmptyResult,
  LoadErrorState,
  TableSkeleton,
} from "@/components/dashboard/page-states";
import { TABLE_BLEED } from "@/components/dashboard/table-bleed";
import { TransactionStatusBadge } from "@/components/dashboard/transaction-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCampaigns, getOrders, type AdOrder } from "@/lib/api/ads";
import { formatDateTime, formatSomAmount } from "@/lib/format";
import { useT } from "@/lib/i18n/provider";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: AdOrder[]; names: Map<string, string> };

export default function OrdersPage() {
  const t = useT("ads");
  const p = useT("portal");
  const cols = t.sheet.orders.columns;
  const [state, setState] = React.useState<State>({ status: "loading" });

  const load = React.useCallback(() => {
    setState({ status: "loading" });
    return Promise.all([getOrders(), getCampaigns()])
      .then(([rows, campaigns]) =>
        setState({
          status: "ready",
          rows,
          names: new Map(campaigns.map((c) => [c.id, c.name])),
        }),
      )
      .catch((err: unknown) =>
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "",
        }),
      );
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8">
      <PageHeader title={p.orders.title} description={p.orders.description} />

      {state.status === "loading" && <TableSkeleton rows={5} />}
      {state.status === "error" && (
        <LoadErrorState message={state.message} onRetry={load} />
      )}
      {state.status === "ready" && state.rows.length === 0 && (
        <EmptyResult
          icon={RiBillLine}
          title={t.sheet.orders.empty}
          description={p.orders.emptyDescription}
        />
      )}
      {state.status === "ready" && state.rows.length > 0 && (
        <Table
          containerClassName={TABLE_BLEED}
          className="min-w-[48rem] text-[0.9375rem]"
        >
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-11 px-0 text-sm font-semibold text-foreground">
                {cols.date}
              </TableHead>
              <TableHead className="h-11 text-sm font-semibold text-foreground">
                {p.orders.campaign}
              </TableHead>
              <TableHead className="h-11 text-sm font-semibold text-foreground">
                {cols.provider}
              </TableHead>
              <TableHead className="h-11 text-right text-sm font-semibold text-foreground">
                {cols.amount}
              </TableHead>
              <TableHead className="h-11 text-sm font-semibold text-foreground">
                {cols.status}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.rows.map((order) => (
              <TableRow key={order.id} className="border-border">
                <TableCell className="h-14 px-0 text-sm whitespace-nowrap text-muted-foreground">
                  {order.createdAt ? formatDateTime(order.createdAt) : "—"}
                </TableCell>
                <TableCell className="max-w-[18rem] truncate font-medium">
                  {state.names.get(order.campaignId) ?? "—"}
                </TableCell>
                <TableCell className="text-sm capitalize">
                  {order.provider}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatSomAmount(order.amount)}
                </TableCell>
                <TableCell>
                  <TransactionStatusBadge status={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
