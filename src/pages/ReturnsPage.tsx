import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import { AlertTriangle, PackageCheck, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/AuthContext";
import { useOrders, useUpdateReturnStatus } from "../hooks/useOrders";
import { formatCurrency } from "../utils/format";
import type { ReturnRecord, ReturnStatus } from "../types/order";
import { ReturnReceivingDialog } from "../features/orders/ReturnReceivingDialog";
import { RefundExposureCards } from "../features/orders/RefundExposureCards";

const statusStyles: Record<ReturnStatus, string> = {
  requested: "bg-blue-100 text-blue-700",
  approved: "bg-amber-100 text-amber-700",
  in_transit: "bg-purple-100 text-purple-700",
  received: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  refunded: "bg-indigo-100 text-indigo-700",
  rejected: "bg-red-100 text-red-700",
};

const formatStatus = (s: string) =>
  s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

interface FlatReturn extends ReturnRecord {
  orderId: string;
  orderNumber: string;
  customerName: string;
  isOverdue: boolean;
}

export function ReturnsPage() {
  const { can } = useAuth();
  const { data: orders } = useOrders();
  const updateReturnStatus = useUpdateReturnStatus();
  const [search, setSearch] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [receivingReturn, setReceivingReturn] = useState<{
    ret: ReturnRecord;
    orderNumber: string;
  } | null>(null);

  const flatReturns = useMemo<FlatReturn[]>(() => {
    if (!orders) return [];
    const now = new Date().getTime();
    const fourteenDays = 14 * 24 * 60 * 60 * 1000;

    return orders.flatMap((order) =>
      order.returns.map((ret) => {
        const approvedEvent = ret.statusHistory.find(
          (h) => h.status === "approved",
        );
        const approvedAt = approvedEvent
          ? new Date(approvedEvent.changedAt).getTime()
          : 0;
        const receivedQty =
          ret.receipts?.reduce((sum, r) => sum + r.receivedQty, 0) ?? 0;
        const isOverdue =
          (ret.status === "approved" || ret.status === "in_transit") &&
          receivedQty < (ret.expectedQty ?? 1) &&
          now - approvedAt > fourteenDays;

        return {
          ...ret,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          isOverdue,
        };
      }),
    );
  }, [orders]);

  const columns = useMemo<ColumnDef<FlatReturn>[]>(
    () => [
      // ORD-10: Bulk Selection Checkbox Column
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
        enableColumnFilter: false,
      },
      {
        id: "order",
        header: "Order",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.orderNumber}</span>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => row.original.customerName,
      },
      {
        id: "reason",
        header: "Reason",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.reason}</span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[row.original.status]}`}
            >
              {formatStatus(row.original.status)}
            </span>
            {row.original.isOverdue && (
              <span
                className="flex items-center gap-1 text-xs font-semibold text-red-600"
                title="Overdue for receipt (>14 days)"
              >
                <AlertTriangle size={12} /> Overdue
              </span>
            )}
          </div>
        ),
      },
      {
        id: "qty",
        header: () => <span className="block text-left">Expected / Received</span>,
        cell: ({ row }) => {
          const expected = row.original.expectedQty ?? 1;
          const received =
            row.original.receipts?.reduce((s, r) => s + r.receivedQty, 0) ?? 0;
          return (
            <span className="block text-left font-mono text-xs">
              {received} / {expected}
            </span>
          );
        },
      },
      {
        id: "refund",
        header: () => <span className="block text-left">Refund Amt</span>,
        cell: ({ row }) => (
          <span className="block text-left">
            {formatCurrency(row.original.refundAmount)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const ret = row.original;
          const expected = ret.expectedQty ?? 1;
          const received =
            ret.receipts?.reduce((s, r) => s + r.receivedQty, 0) ?? 0;
          if (!can("orders", "edit")) return null;

          // Requested → Approve / Reject
          if (ret.status === "requested") {
            return (
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    updateReturnStatus.mutate({
                      id: ret.orderId,
                      returnId: ret.id,
                      status: "approved",
                    })
                  }
                  className="rounded-md border border-green-600 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-50"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    updateReturnStatus.mutate({
                      id: ret.orderId,
                      returnId: ret.id,
                      status: "rejected",
                    })
                  }
                  className="rounded-md border border-red-600 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  Reject
                </button>
              </div>
            );
          }

          // Approved / In Transit → Receive (physical receiving)
          if (
            (ret.status === "approved" || ret.status === "in_transit") &&
            received < expected
          ) {
            return (
              <button
                onClick={() =>
                  setReceivingReturn({
                    ret,
                    orderNumber: ret.orderNumber,
                  })
                }
                className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:opacity-90"
              >
                <PackageCheck size={12} /> Receive
              </button>
            );
          }

          // Received → Close & Refund (final financial step)
          if (ret.status === "received") {
            return (
              <button
                onClick={() =>
                  updateReturnStatus.mutate({
                    id: ret.orderId,
                    returnId: ret.id,
                    status: "closed",
                  })
                }
                className="rounded-md border border-indigo-600 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Close & Refund
              </button>
            );
          }

          return null;
        },
      },
    ],
    [can, updateReturnStatus],
  );

  const table = useReactTable({
    data: flatReturns,
    columns,
    state: { globalFilter: search, rowSelection },
    onGlobalFilterChange: setSearch,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // ORD-10: Only allow selecting returns that are in the "requested" state
    enableRowSelection: (row) => row.original.status === "requested", 
  });

  const selectedCount = Object.keys(rowSelection).length;

  const handleBulkAction = (status: "approved" | "rejected") => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    selectedIndices.forEach((idx) => {
      const ret = flatReturns[idx];
      if (ret) {
        updateReturnStatus.mutate({ id: ret.orderId, returnId: ret.id, status });
      }
    });
    setRowSelection({}); // Clear selection after action
  };

  if (!can("orders", "view")) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <ShieldAlert size={40} />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
      </Card>
    );
  }

  return (
    <div className="space-y-4 pb-20"> {/* Added pb-20 for floating bar spacing */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Returns & Receiving</h1>
          <p className="text-sm text-muted-foreground">
            Track return lifecycles and physical warehouse receiving.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders or reasons…"
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* ORD-05 / ORD-06: Financial Exposure KPIs */}
      <RefundExposureCards />

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr
                  key={hg.id}
                  className="border-b text-left text-muted-foreground"
                >
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-4 py-3 font-medium">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No returns found.
                  </td>
                </tr>
              )}
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-muted/50 ${row.original.isOverdue ? "bg-red-50/50" : ""}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORD-10: Bulk Actions Floating Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-xl">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <button 
            onClick={() => handleBulkAction("approved")} 
            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Bulk Approve
          </button>
          <button 
            onClick={() => handleBulkAction("rejected")} 
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Bulk Reject
          </button>
          <button 
            onClick={() => setRowSelection({})} 
            className="text-xs text-muted-foreground hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {receivingReturn && (
        <ReturnReceivingDialog
          open={!!receivingReturn}
          onClose={() => setReceivingReturn(null)}
          returnRecord={receivingReturn.ret}
          orderNumber={receivingReturn.orderNumber}
        />
      )}
    </div>
  );
}