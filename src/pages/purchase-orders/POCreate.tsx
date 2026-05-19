import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stepper, StepperLabel } from "@/components/ui/Stepper";
import { usePOStore } from "@/store/usePOStore";
import { useCreatePO } from "@/hooks/usePurchaseOrders";
import { useVendors } from "@/hooks/useVendors";
import { useCreateVendor } from "@/hooks/useVendors";
import { formatCurrency } from "@/utils/formatCurrency";
import { Vendor, POLineItem } from "@/types";
import toast from "react-hot-toast";

const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstin: z.string().optional(),
});

const poDetailsSchema = z.object({
  poNumber: z.string().min(1, "PO number required"),
  approvedAmount: z.number().optional().default(0),
  taxRate: z.number().min(0).default(0),
  taxAmount: z.number().optional().default(0),
  currency: z.string().default("USD"),
  description: z.string().optional(),
  deliveryDate: z.string().optional(),
});

const steps = [
  { id: "vendor", label: "Select Vendor" },
  { id: "details", label: "PO Details" },
  { id: "items", label: "Line Items" },
  { id: "review", label: "Review" },
];

export default function POCreate() {
  const navigate = useNavigate();
  const {
    draftPO,
    currentStep,
    updateDraftPO,
    nextStep,
    prevStep,
    setStep,
    resetDraft,
  } = usePOStore();
  const { data: vendorsData } = useVendors({ limit: 100 });
  const createPOMutation = useCreatePO();
  const createVendorMutation = useCreateVendor();
  const [useExistingVendor, setUseExistingVendor] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");

  const vendorForm = useForm({
    resolver: zodResolver(vendorSchema),
    defaultValues: { name: "", email: "", phone: "", address: "", gstin: "" },
  });

  const initialPONumber = React.useMemo(
    () =>
      // eslint-disable-next-line react-hooks/purity
      `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    [],
  );

  const detailsForm = useForm({
    resolver: zodResolver(poDetailsSchema),
    defaultValues: {
      poNumber: initialPONumber,
      approvedAmount: 0,
      taxRate: 0,
      taxAmount: 0,
      currency: "USD",
      description: "",
      deliveryDate: "",
    },
  });

  // Watch for taxRate changes to update store immediately
  const watchedTaxRate = detailsForm.watch("taxRate");
  React.useEffect(() => {
    if (typeof watchedTaxRate === "number") {
      updateDraftPO({ taxRate: watchedTaxRate });
    }
  }, [watchedTaxRate, updateDraftPO]);

  const handleVendorNext = async () => {
    if (useExistingVendor) {
      if (!selectedVendorId) {
        toast.error("Please select a vendor");
        return;
      }
      updateDraftPO({ vendorId: selectedVendorId });
    } else {
      const isValid = await vendorForm.trigger();
      if (!isValid) return;

      const vendorData = vendorForm.getValues();
      try {
        const newVendor = await createVendorMutation.mutateAsync(vendorData);
        updateDraftPO({ vendorId: newVendor.id });
      } catch {
        return;
      }
    }
    nextStep();
  };

  const handleDetailsNext = async () => {
    const isValid = await detailsForm.trigger();
    if (!isValid) return;

    const details = detailsForm.getValues();
    updateDraftPO(details);
    nextStep();
  };

  const handleAddLineItem = () => {
    const newItems = [
      ...(draftPO.lineItems || []),
      { description: "", qty: 1, unitPrice: 0, total: 0 },
    ];
    updateDraftPO({ lineItems: newItems });
  };

  const handleRemoveLineItem = (index: number) => {
    const newItems = (draftPO.lineItems || []).filter((_, i) => i !== index);
    updateDraftPO({ lineItems: newItems });
  };

  const handleUpdateLineItem = (
    index: number,
    field: keyof POLineItem,
    value: string | number,
  ) => {
    const items = [...(draftPO.lineItems || [])];
    const item = { ...items[index] };

    if (field === "qty" || field === "unitPrice") {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      const finalValue = numValue || 0;

      if (field === "qty") {
        item.qty = finalValue;
      } else if (field === "unitPrice") {
        item.unitPrice = finalValue;
      }
      item.total = item.qty * item.unitPrice;
    } else if (field === "description") {
      item.description = value as string;
    }

    items[index] = item;
    updateDraftPO({ lineItems: items });
  };

  const subtotal = (draftPO.lineItems || []).reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const taxAmount = (subtotal * (draftPO.taxRate || 0)) / 100;
  const totalAmount = subtotal + taxAmount;

  // Sync approvedAmount and taxAmount with calculated total
  React.useEffect(() => {
    if (
      totalAmount !== draftPO.approvedAmount ||
      taxAmount !== draftPO.taxAmount
    ) {
      updateDraftPO({
        approvedAmount: totalAmount,
        taxAmount: taxAmount,
      });
    }
  }, [totalAmount, taxAmount, draftPO.approvedAmount, draftPO.taxAmount, updateDraftPO]);

  const handleSubmit = async () => {
    if (!draftPO.lineItems || draftPO.lineItems.length === 0) {
      toast.error("Add at least one line item");
      return;
    }

    try {
      await createPOMutation.mutateAsync({
        poNumber: draftPO.poNumber!,
        vendorId: draftPO.vendorId!,
        approvedAmount: draftPO.approvedAmount!,
        taxRate: draftPO.taxRate,
        taxAmount: draftPO.taxAmount,
        currency: draftPO.currency || "USD",
        description: draftPO.description,
        deliveryDate: draftPO.deliveryDate,
        lineItems: draftPO.lineItems,
        status: "draft",
      });
      resetDraft();
      navigate("/purchase-orders");
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Purchase Order"
        description="Add a new purchase order"
        
      />

      <Card className="mb-8">
        <CardContent className="pt-6">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setStep}
          />
          <div className="mt-6">
            <StepperLabel steps={steps} currentStep={currentStep} />
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Vendor Selection */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">
              Select or Create Vendor
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={useExistingVendor}
                  onChange={() => setUseExistingVendor(true)}
                  className="w-4 h-4"
                />
                <span className="text-slate-100">Use Existing Vendor</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!useExistingVendor}
                  onChange={() => setUseExistingVendor(false)}
                  className="w-4 h-4"
                />
                <span className="text-slate-100">Create New Vendor</span>
              </label>
            </div>

            {useExistingVendor ? (
              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Select Vendor
                </label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select a vendor --</option>
                  {vendorsData?.items?.map((vendor: Vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} ({vendor.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Vendor Name *
                  </label>
                  <input
                    {...vendorForm.register("name")}
                    placeholder="Acme Corp"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  {vendorForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-rose-400">
                      {vendorForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Email *
                  </label>
                  <input
                    {...vendorForm.register("email")}
                    type="email"
                    placeholder="vendor@example.com"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  {vendorForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-rose-400">
                      {vendorForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-2">
                      Phone
                    </label>
                    <input
                      {...vendorForm.register("phone")}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-2">
                      GSTIN
                    </label>
                    <input
                      {...vendorForm.register("gstin")}
                      placeholder="27AABCT1234H1Z0"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Address
                  </label>
                  <textarea
                    {...vendorForm.register("address")}
                    placeholder="123 Business St, City, State 12345"
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/purchase-orders")}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleVendorNext}
                isLoading={createVendorMutation.isPending}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: PO Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">
              Purchase Order Details
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">
                PO Number *
              </label>
              <input
                {...detailsForm.register("poNumber")}
                placeholder="PO-2024-001"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {detailsForm.formState.errors.poNumber && (
                <p className="mt-1 text-sm text-rose-400">
                  {detailsForm.formState.errors.poNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  {...detailsForm.register("taxRate", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  placeholder="0"
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
                placeholder="Order details..."
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button variant="primary" onClick={handleDetailsNext}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Line Items */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">
                Line Items
              </h2>
              <Button size="sm" variant="primary" onClick={handleAddLineItem}>
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(draftPO.lineItems || []).length > 0 ? (
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
                    {(draftPO.lineItems || []).map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="px-4 py-3">
                          <input
                            value={item.description}
                            onChange={(e) =>
                              handleUpdateLineItem(
                                idx,
                                "description",
                                e.target.value,
                              )
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
                              handleUpdateLineItem(
                                idx,
                                "unitPrice",
                                e.target.value,
                              )
                            }
                            className="w-24 rounded bg-white/5 border border-white/10 px-2 py-1 text-sm text-slate-100 text-right focus:border-indigo-500 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-100">
                          {formatCurrency(
                            item.total,
                            draftPO.currency || "USD",
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveLineItem(idx)}
                            className="text-slate-400 hover:text-rose-400 transition-colors"
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
                No line items added. Click "Add Item" to get started.
              </p>
            )}

            <div className="border-t border-white/5 pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-slate-100">
                      {formatCurrency(subtotal, draftPO.currency || "USD")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Tax ({draftPO.taxRate || 0}%)
                    </span>
                    <span className="text-slate-100">
                      {formatCurrency(taxAmount, draftPO.currency || "USD")}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-white/10 pt-2">
                    <span className="text-slate-100">Total</span>
                    <span className="text-indigo-400">
                      {formatCurrency(totalAmount, draftPO.currency || "USD")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                variant="primary"
                onClick={nextStep}
                disabled={(draftPO.lineItems || []).length === 0}
              >
                Review <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">
              Review Purchase Order
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-400">PO Number</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">
                  {draftPO.poNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Approved Amount</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">
                  {formatCurrency(
                    draftPO.approvedAmount || 0,
                    draftPO.currency || "USD",
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Delivery Date</p>
                <p className="mt-1 text-slate-100">
                  {draftPO.deliveryDate || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Currency</p>
                <p className="mt-1 text-slate-100">{draftPO.currency}</p>
              </div>
            </div>

            {draftPO.description && (
              <div>
                <p className="text-sm text-slate-400">Description</p>
                <p className="mt-1 text-slate-100">{draftPO.description}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-slate-400 mb-3">Line Items</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-4 py-2 text-left text-slate-400">
                        Description
                      </th>
                      <th className="px-4 py-2 text-right text-slate-400">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-right text-slate-400">
                        Unit Price
                      </th>
                      <th className="px-4 py-2 text-right text-slate-400">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(draftPO.lineItems || []).map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="px-4 py-2 text-slate-100">
                          {item.description}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-100">
                          {item.qty}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-100">
                          {formatCurrency(
                            item.unitPrice,
                            draftPO.currency || "USD",
                          )}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-100">
                          {formatCurrency(
                            item.total,
                            draftPO.currency || "USD",
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-slate-100">
                      {formatCurrency(subtotal, draftPO.currency || "USD")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Tax ({draftPO.taxRate || 0}%)
                    </span>
                    <span className="text-slate-100">
                      {formatCurrency(taxAmount, draftPO.currency || "USD")}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-white/10 pt-2">
                    <span className="text-slate-100">Total Amount</span>
                    <span className="text-indigo-400">
                      {formatCurrency(totalAmount, draftPO.currency || "USD")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/purchase-orders")}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  isLoading={createPOMutation.isPending}
                >
                  Create PO
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
