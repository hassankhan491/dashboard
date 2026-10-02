import { ArrowDown, ArrowUp, History } from "lucide-react";
import { Dialog } from "../../components/ui/Dialog";
import { usePriceHistory } from "../../hooks/useInventory";
import { formatCurrency, formatDate } from "../../utils/format";

interface Props {
  open: boolean;
  onClose: () => void;
  variantId: string;
  variantName: string;
}

export function PriceHistoryDialog({
  open,
  onClose,
  variantId,
  variantName,
}: Props) {
  const { data: history, isLoading } = usePriceHistory(variantId);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Price History: ${variantName}`}
      wide
    >
      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Loading history…
        </p>
      ) : history && history.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Source PO</th>
                <th className="py-2 pr-4 text-right font-medium">Qty Added</th>
                <th className="py-2 pr-4 text-right font-medium">
                  Old Avg Cost
                </th>
                <th className="py-2 pr-4 text-right font-medium">
                  New Unit Cost
                </th>
                <th className="py-2 pr-4 text-right font-medium">Change</th>
                <th className="py-2 text-right font-medium">New Avg Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((event) => {
                const isIncrease = event.newCost > event.oldCost;
                const difference = event.newCost - event.oldCost;

                return (
                  <tr key={event.id} className="hover:bg-muted/50">
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatDate(event.recordedAt)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      {event.poId ? (
                        <span className="rounded bg-muted px-1.5 py-0.5">
                          {event.poId.toUpperCase()}
                        </span>
                      ) : (
                        "Manual"
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right font-medium">
                      +{event.quantityAdded}
                    </td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">
                      {formatCurrency(event.oldCost)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span
                        className={`flex items-center justify-end gap-1 ${
                          isIncrease ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isIncrease ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )}
                        {formatCurrency(event.newCost)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {difference > 0 ? (
                        <span className="text-xs font-semibold text-red-600">
                          ↑ Increased by {formatCurrency(difference)}
                        </span>
                      ) : difference < 0 ? (
                        <span className="text-xs font-semibold text-green-600">
                          ↓ Decreased by {formatCurrency(Math.abs(difference))}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No change
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {formatCurrency(event.newAverageCost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 text-center">
          <History className="mb-2 text-muted-foreground" size={32} />
          <p className="text-sm text-muted-foreground">
            No price changes recorded for this variant yet.
          </p>
        </div>
      )}
    </Dialog>
  );
}