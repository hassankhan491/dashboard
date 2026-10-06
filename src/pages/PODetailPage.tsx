import { ArrowLeft, CheckCircle2, PackageCheck, Plus, Wallet } from 'lucide-react';
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/AuthContext";
import { useProducts } from "../hooks/useProducts";
import {
  usePOExceptions,
  usePOExpenses,
  usePOFinancials,
  usePOInvoices,
  usePOPayments,
  usePurchaseOrder,
  useSuppliers,
  useUpdatePOStatus,
} from "../hooks/usePurchasing";
import { formatCurrency, formatDate } from "../utils/format";
import type { POStatus } from "../types/purchasing";
import { InvoiceFormDialog } from "../features/purchasing/InvoiceFormDialog";
import { PaymentFormDialog } from "../features/purchasing/PaymentFormDialog";
import { ExpenseFormDialog } from "../features/purchasing/ExpenseFormDialog";
import { AttachmentLink } from "../components/AttachmentLink";
import { ReceivePODialog } from '../features/purchasing/ReceivePODialog';


const statusStyles: Record<POStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  ordered: "bg-blue-100 text-blue-700",
  partially_received: "bg-amber-100 text-amber-700",
  received: "bg-green-100 text-green-700",
  closed: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-700",
};

const availabilityStyles: Record<string, string> = {
  in_stock: "bg-green-100 text-green-700",
  short_quantity: "bg-amber-100 text-amber-700",
  out_of_stock: "bg-red-100 text-red-700",
  backordered: "bg-purple-100 text-purple-700",
};

const paymentStatusStyles: Record<string, string> = {
  unpaid: "bg-red-100 text-red-700",
  partially_paid: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
};

const formatStatus = (s: string) =>
  s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

type TabKey =
  | "items"
  | "invoices"
  | "payments"
  | "expenses"
  | "financials"
  | "activity";

export function PODetailPage() {
  const { poId } = useParams<{ poId: string }>();
  const { can } = useAuth();
  const { data: po, isLoading } = usePurchaseOrder(poId);
  const { data: suppliers } = useSuppliers();
  const { data: products } = useProducts();
  const { data: invoices } = usePOInvoices(poId);
  const { data: payments } = usePOPayments(poId);
  const { data: expenses } = usePOExpenses(poId);
  const { data: exceptions } = usePOExceptions(poId);
  const { data: financials } = usePOFinancials(poId);
  const updateStatus = useUpdatePOStatus();

  const [activeTab, setActiveTab] = useState<TabKey>("items");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false); // <-- EDIT 2: Receive dialog state

  if (isLoading)
    return (
      <Card>
        <p className="text-sm text-muted-foreground">Loading PO…</p>
      </Card>
    );
  if (!po)
    return (
      <Card className="p-12 text-center">
        <h1 className="text-xl font-bold">PO not found</h1>
        <Link
          to="/purchasing"
          className="mt-2 text-sm text-primary hover:underline"
        >
          Back to purchasing
        </Link>
      </Card>
    );

  const supplier = suppliers?.find((s) => s.id === po.supplierId);
  const openExceptions = (exceptions ?? []).filter((e) => e.status === "open");

  const getVariantDetails = (variantId: string) => {
    for (const p of products ?? []) {
      const v = p.variants.find((v) => v.id === variantId);
      if (v) return { productName: p.name, sku: v.sku };
    }
    return { productName: "Unknown Product", sku: "—" };
  };

  // EDIT 3: Updated status workflow (partial receiving is handled by the engine)
  const getNextStatus = (): POStatus | null => {
    switch (po.status) {
      case "draft":
        return "ordered";
      case "ordered":
        return "received";
      case "partially_received":
        return "received";
      case "received":
        return "closed";
      default:
        return null;
    }
  };
  const nextStatus = getNextStatus();

  const tabs: { key: TabKey; label: string }[] = [
    { key: "items", label: `Items (${po.items.length})` },
    { key: "invoices", label: `Invoices (${invoices?.length ?? 0})` },
    { key: "payments", label: `Payments (${payments?.length ?? 0})` },
    { key: "expenses", label: `Expenses (${expenses?.length ?? 0})` },
    { key: "financials", label: "Financial Summary" },
    { key: "activity", label: "Activity" },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/purchasing"
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{po.poNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {supplier?.name ?? "Unknown Supplier"} · Expected{" "}
            {formatDate(po.expectedDelivery)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[po.status]}`}
        >
          {formatStatus(po.status)}
        </span>

        {/* EDIT 4A: Action group with Receive Items + Status button */}
        <div className="ml-auto flex items-center gap-2">
          {(po.status === "ordered" || po.status === "partially_received") && (
            <button
              onClick={() => setReceiveOpen(true)}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <PackageCheck size={16} /> Receive Items
            </button>
          )}
          {nextStatus && (
            <button
              onClick={() =>
                updateStatus.mutate(
                  { id: po.id, status: nextStatus },
                  { onError: (err) => alert(err.message) },
                )
              }
              disabled={updateStatus.isPending}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <CheckCircle2 size={16} />{" "}
              {updateStatus.isPending
                ? "Updating…"
                : `Mark as ${formatStatus(nextStatus)}`}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ITEMS TAB */}
      {activeTab === "items" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Product / SKU</th>
                  <th className="py-2 pr-4 text-right font-medium">Ordered</th>
                  <th className="py-2 pr-4 text-right font-medium">Received</th>
                  <th className="py-2 pr-4 text-right font-medium">
                    Unit Cost
                  </th>
                  <th className="py-2 pr-4 text-right font-medium">
                    Line Total
                  </th>
                  <th className="py-2 font-medium">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {po.items.map((item) => {
                  const details = getVariantDetails(item.variantId);
                  return (
                    <tr key={item.id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium">{details.productName}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {details.sku}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {item.orderedQty}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {item.receivedQty}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium">
                        {formatCurrency(item.orderedQty * item.unitCost)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${availabilityStyles[item.availabilityStatus]}`}
                        >
                          {formatStatus(item.availabilityStatus)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {openExceptions.length > 0 && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
              <h3 className="text-sm font-semibold text-red-700">
                Open Stock Exceptions
              </h3>
              <ul className="mt-2 space-y-1 text-xs text-red-700">
                {openExceptions.map((e) => (
                  <li key={e.id}>
                    • {formatStatus(e.type)}: {e.reason}
                    {e.expectedResolution
                      ? ` (expected ${formatDate(e.expectedResolution)})`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* INVOICES TAB */}
      {activeTab === "invoices" && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Supplier Invoices</h2>
            {can("purchasing", "create") && (
              <button
                onClick={() => setInvoiceOpen(true)}
                className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Plus size={14} /> Attach Invoice
              </button>
            )}
          </div>
          {invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Invoice #</th>
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 text-right font-medium">Amount</th>
                    <th className="py-2 pr-4 font-medium">File</th>
                    <th className="py-2 font-medium">Added By</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-3 pr-4 font-mono text-xs">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 pr-4">
                        {formatDate(inv.invoiceDate)}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="py-3 pr-4 text-xs">
                        {inv.fileName ? (
                          <AttachmentLink
                            fileName={inv.fileName}
                            title={`Supplier Invoice ${inv.invoiceNumber}`}
                            lines={[
                              `Invoice Number: ${inv.invoiceNumber}`,
                              `Amount: ${inv.amount.toFixed(2)}`,
                              `Linked PO: ${po.poNumber}`,
                              `Supplier: ${supplier?.name ?? "—"}`,
                              `Added By: ${inv.createdBy}`,
                            ]}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {inv.createdBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No invoices attached yet.
            </p>
          )}
        </Card>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === "payments" && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Payments</h2>
            {can("purchasing", "create") && (
              <button
                onClick={() => setPaymentOpen(true)}
                className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Plus size={14} /> Record Payment
              </button>
            )}
          </div>
          {payments && payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 text-right font-medium">
                      Paid Amount
                    </th>
                    <th className="py-2 pr-4 font-medium">Method</th>
                    <th className="py-2 pr-4 font-medium">Reference</th>
                    <th className="py-2 pr-4 font-medium">Slip</th>
                    <th className="py-2 font-medium">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((pay) => (
                    <tr key={pay.id}>
                      <td className="py-3 pr-4">
                        {formatDate(pay.paymentDate)}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium">
                        {formatCurrency(pay.paidAmount)}
                      </td>
                      <td className="py-3 pr-4 capitalize">
                        {pay.method.replace("_", " ")}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs">
                        {pay.reference ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-xs">
                        {pay.slipFileName ? (
                          <AttachmentLink
                            fileName={pay.slipFileName}
                            title={`Payment Slip ${pay.reference ?? pay.id}`}
                            lines={[
                              `Paid Amount: ${pay.paidAmount.toFixed(2)}`,
                              `Method: ${pay.method.replace("_", " ")}`,
                              `Reference: ${pay.reference ?? "—"}`,
                              `Linked PO: ${po.poNumber}`,
                              `Recorded By: ${pay.recordedBy}`,
                            ]}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {pay.recordedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No payments recorded yet.
            </p>
          )}
        </Card>
      )}

      {/* EXPENSES TAB */}
      {activeTab === "expenses" && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Indirect Expenses</h2>
            {can("purchasing", "create") && (
              <button
                onClick={() => setExpenseOpen(true)}
                className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Plus size={14} /> Add Expense
              </button>
            )}
          </div>
          {expenses && expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 pr-4 text-right font-medium">Amount</th>
                    <th className="py-2 pr-4 font-medium">Note</th>
                    <th className="py-2 font-medium">Added By</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="py-3 pr-4">
                        <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4">{formatDate(exp.date)}</td>
                      <td className="py-3 pr-4 text-right font-medium">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">
                        {exp.note ?? "—"}
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {exp.createdBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex justify-end border-t pt-2 text-sm font-semibold">
                Total Indirect:{" "}
                {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No indirect expenses recorded.
            </p>
          )}
        </Card>
      )}

      {/* FINANCIALS TAB */}
      {activeTab === "financials" && financials && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="mb-3 font-semibold">Cost Build-up (Landed Cost)</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal (items)</dt>
                <dd className="font-medium">
                  {formatCurrency(financials.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-medium">
                  {formatCurrency(financials.shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax / Duty</dt>
                <dd className="font-medium">
                  {formatCurrency(financials.taxDuty)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Other Charges</dt>
                <dd className="font-medium">
                  {formatCurrency(financials.otherCharges)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Indirect Expenses</dt>
                <dd className="font-medium">
                  {formatCurrency(financials.indirectExpenses)}
                </dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="font-semibold">Expected Total</dt>
                <dd className="text-lg font-bold">
                  {formatCurrency(financials.expectedTotal)}
                </dd>
              </div>
            </dl>
          </Card>
          <Card>
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <Wallet size={16} /> Invoice & Payment Reconciliation
            </h2>
            {financials.toleranceBreached && (
              <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                ⚠ PO vs Invoice mismatch exceeds tolerance! Review required.
              </p>
            )}
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Invoice Total</dt>
                <dd className="font-medium">
                  {formatCurrency(financials.invoiceTotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  PO vs Invoice Difference
                </dt>
                <dd
                  className={`font-medium ${Math.abs(financials.poVsInvoiceDiff) > 0.01 ? "text-red-600" : "text-green-600"}`}
                >
                  {formatCurrency(financials.poVsInvoiceDiff)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Paid Total</dt>
                <dd className="font-medium">
                  {formatCurrency(financials.paidTotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Remaining Balance</dt>
                <dd className="font-medium">
                  {formatCurrency(financials.remainingBalance)}
                </dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="font-semibold">Payment Status</dt>
                <dd>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${paymentStatusStyles[financials.paymentStatus]}`}
                  >
                    {formatStatus(financials.paymentStatus)}
                  </span>
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      )}

      {/* ACTIVITY TAB */}
      {activeTab === "activity" && (
        <Card>
          <h2 className="mb-4 font-semibold">Status History</h2>
          <ol className="space-y-4">
            {po.statusHistory.map((event) => (
              <li key={event.id} className="flex gap-3">
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {formatStatus(event.status)}{" "}
                    <span className="text-muted-foreground">
                      by {event.changedBy}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event.changedAt)}
                    {event.note ? ` · ${event.note}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Dialogs */}
      <InvoiceFormDialog
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        poId={po.id}
      />
      <PaymentFormDialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        poId={po.id}
        invoices={invoices ?? []}
      />
      <ExpenseFormDialog
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        poId={po.id}
      />
      {/* EDIT 4B: Receive Items dialog */}
      <ReceivePODialog
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        po={po}
      />
    </div>
  );
}