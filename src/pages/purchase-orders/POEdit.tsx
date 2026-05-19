import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { usePurchaseOrder, useUpdatePO } from "@/hooks/usePurchaseOrders";
import { POLineItem } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";
import toast from "react-hot-toast";

const poDetailsSchema = z.object({
  poNumber: z.string().min(1, "PO number required"),
  taxRate: z.number().min(0).default(0),
  currency: z.string().default("USD"),
  description: z.string().optional(),
  deliveryDate: z.string().optional(),
});

type PODetailsValues = z.infer<typeof poDetailsSchema>;

export default function POEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: po, isLoading } = usePurchaseOrder(id || "");
  const updateMutation = useUpdatePO(id || "");

  const [lineItems, setLineItems] = useState<POLineItem[]>([]);

  const detailsForm = useForm<PODetailsValues>({
    resolver: zodResolver(poDetailsSchema),
    defaultValues: {
      poNumber: "",
      taxRate: 0,
      currency: "USD",
      description: "",
      deliveryDate: "",
    },
  });

  // Hydrate the form once PO data arrives
  useEffect(() => {
    if (!po) return;

    detailsForm.reset({
      poNumber: po.poNumber,
      taxRate: po.taxRate ?? 0,
      currency: po.currency || "USD",
      description: po.description || "",
      deliveryDate: po.deliveryDate ? po.deliveryDate.slice(0, 10) : "",
    });

    setLineItems(
      (po.lineItems || []).map((item) => ({
        description: item.description,
        qty: item.qty,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    );
  }, [po, detailsForm]);

  // Block editing if PO is not a draft
  useEffect(() => {
    if (po && po.status !== "draft") {
      toast.error("Only draft POs can be edited");
      navigate(`/purchase-orders/${po.id}`, { replace: true });
    }
  }, [po, navigate]);

  const watchedTaxRate = detailsForm.watch("taxRate");
  const watchedCurrency = detailsForm.watch("currency");

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + (item.total || 0), 0),
    [lineItems],
  );
  const taxAmount = useMemo(
    () => (subtotal * (watchedTaxRate || 0)) / 100,
    [subtotal, watchedTaxRate],
  );
  const totalAmount = subtotal + taxAmount;

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", qty: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLineItem = (
    index: number,
    field: keyof POLineItem,
    value: string | number,
  ) => {
    setLineItems((prev) => {
      const next = [...prev];
      const item = { ...next[index] };

      if (field === "qty" || field === "unitPrice") {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        const finalValue = Number.isFinite(numValue) ? (numValue as number) : 0;
        if (field === "qty") item.qty = finalValue;
        if (field === "unitPrice") item.unitPrice = finalValue;
        item.total = (item.qty || 0) * (item.unitPrice || 0);
      } else if (field === "description") {
        item.description = value as string;
      }

      next[index] = item;
      return next;
    });
  };

  const handleSave = async () => {
    const valid = await detailsForm.trigger();
    if (!valid) return;

    if (lineItems.length === 0) {
      toast.error("Add at least one line item");
      return;
    }

    const values = detailsForm.getValues();

    try {
      await updateMutation.mutateAsync({
        poNumber: values.poNumber,
        taxRate: values.taxRate,
        taxAmount,
        approvedAmount: totalAmount,
        currency: values.currency,
        description: values.description,
        deliveryDate: values.deliveryDate || undefined,
        lineItems,
      });
      navigate(`/purchase-orders/${id}`);
    } catch {
      // Mutation hook surfaces the toast
    }
  };

  if (isLoading || !po) {
    return (
      <div>
        <PageHeader title="Edit Purchase Order" onBack={() => navigate(-1)} />
        <Card>
          <CardContent className="pt-6">
            <LoadingSkeleton count={5} height="h-12" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${po.poNumber}`}
        description="Update draft purchase order"
        onBack={() => navigate(`/purchase-orders/${po.id}`)}
      />

      {/* Details */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-100">Details</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">
              PO Number *
            </label>
            <input
              {...detailsForm.register("poNumber")}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            {detailsForm.formState.errors.poNumber && (
              <p className="mt-1 text-sm text-rose-400">
                {detailsForm.formState.errors.poNumber.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">
                Tax Rate (%)
              </label>
              <input
                {...detailsForm.register("taxRate", { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">
                Currency
              </label>
              <select
                {...detailsForm.register("currency")}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">
              Delivery Date
            </label>
            <input
              {...detailsForm.register("deliveryDate")}
              type="date"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">
              Description
            </label>
            <textarea
              {...detailsForm.register("description")}
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Line Items</h2>
            <Button size="sm" variant="primary" onClick={handleAddLineItem}>
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {lineItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        <input
                          value={item.description}
                          onChange={(e) =>
                            handleUpdateLineItem(idx, "description", e.target.value)
                          }
                          placeholder="Item description"
                          className="w-full rounded bg-white/5 border border-white/10 px-2 py-1 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            handleUpdateLineItem(idx, "qty", e.target.value)
                          }
                          className="w-20 rounded bg-white/5 border border-white/10 px-2 py-1 text-sm text-slate-100 text-right focus:border-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateLineItem(idx, "unitPrice", e.target.value)
                          }
                          className="w-24 rounded bg-white/5 border border-white/10 px-2 py-1 text-sm text-slate-100 text-right focus:border-indigo-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-100">
                        {formatCurrency(item.total, watchedCurrency || "USD")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-slate-400 hover:text-rose-400 transition-colors"
                          aria-label="Remove line item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-400 py-8">
              No line items. Click "Add Item" to get started.
            </p>
          )}

          <div className="border-t border-white/5 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-slate-100">
                    {formatCurrency(subtotal, watchedCurrency || "USD")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">
                    Tax ({watchedTaxRate || 0}%)
                  </span>
                  <span className="text-slate-100">
                    {formatCurrency(taxAmount, watchedCurrency || "USD")}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-white/10 pt-2">
                  <span className="text-slate-100">Total</span>
                  <span className="text-indigo-400">
                    {formatCurrency(totalAmount, watchedCurrency || "USD")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => navigate(`/purchase-orders/${po.id}`)}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={updateMutation.isPending}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
