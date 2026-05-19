import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PaymentButton } from "@/components/ui/PaymentButton";
import { PaymentConfirmationModal } from "@/components/ui/PaymentConfirmationModal";
import { PayoutButton } from "@/components/ui/PayoutButton";
import { useInvoice, useUpdateInvoiceStatus } from "@/hooks/useInvoices";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useVendors } from "@/hooks/useVendors";
import { useCreatePayment } from "@/hooks/usePayments";
import { useCreatePayout } from "@/hooks/usePayouts";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import toast from "react-hot-toast";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: invoice, isLoading } = useInvoice(id || "");
  const { data: vendorsData } = useVendors({ limit: 100 });
  const { data: posData } = usePurchaseOrders({ limit: 100 });
  const updateStatusMutation = useUpdateInvoiceStatus(id || "");
  const createPaymentMutation = useCreatePayment();
  const createPayoutMutation = useCreatePayout();

  // Find related vendor and PO
  const vendor = vendorsData?.items?.find((v) => v.id === invoice?.vendorId);
  const po = invoice?.poNumber
    ? posData?.items?.find((p) => p.poNumber === invoice.poNumber)
    : null;

  const handleApprove = async () => {
    try {
      await updateStatusMutation.mutateAsync({ status: "approved" });
      toast.success("Invoice approved");
      setTimeout(() => navigate("/invoices"), 1500);
    } catch {
      // Error handled by mutation
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      await updateStatusMutation.mutateAsync({
        status: "rejected",
        rejectionReason,
      });
      toast.success("Invoice rejected");
      setShowRejectModal(false);
      setTimeout(() => navigate("/invoices"), 1500);
    } catch {
      // Error handled by mutation
    }
  };

  const handlePaymentClick = () => {
    setShowPaymentModal(true);
  };

  const handlePayoutClick = async () => {
    if (!invoice) return;
    try {
      await createPayoutMutation.mutateAsync({
        invoiceId: invoice.id,
        amount: invoice.amountDue || invoice.totalAmount,
        vendorId: invoice.vendorId,
      });
    } catch {
      // error handled by mutation hook
    }
  };

  const handlePaymentConfirm = async (invoiceId: string) => {
    if (!invoice) return;

    try {
      await createPaymentMutation.mutateAsync({
        invoiceId,
        amount: invoice.amountDue,
        currency: invoice.currency,
      });
      
      // Success is handled by the mutation (toast + data refresh)
      setShowPaymentModal(false);
    } catch {
      // Error is handled by the mutation (toast displayed)
      // Keep modal open to allow retry
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Invoice Details" onBack={() => navigate(-1)} />
        <Card>
          <CardContent className="pt-6">
            <LoadingSkeleton count={5} height="h-12" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12 text-slate-400">Invoice not found</div>
    );
  }

  const canApprove =
    invoice.status === "received" ||
    invoice.status === "processing" ||
    invoice.status === "validated" ||
    invoice.status === "review_pending";
  const canReject =
    invoice.status === "received" ||
    invoice.status === "processing" ||
    invoice.status === "validated" ||
    invoice.status === "review_pending";

  return (
    <div>
      <PageHeader
        title={invoice.invoiceNumber}
        onBack={() => navigate(-1)}
      />

      {/* Invoice Preview */}
      <Card className="mb-6 bg-white/5 backdrop-blur-md">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Invoice Number</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={invoice.status} />
                {invoice.isDuplicate && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 border border-orange-500/50 rounded-full">
                    <AlertCircle className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-orange-400">Duplicate</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-400">Vendor</p>
                <p className="mt-1 text-slate-100">{invoice.vendorName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Invoice Date</p>
                <p className="mt-1 text-slate-100">
                  {invoice.invoiceDate ? formatDate(invoice.invoiceDate) : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Due Date</p>
                <p className="mt-1 text-slate-100">
                  {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">PO Number</p>
                <p className="mt-1 text-slate-100">{invoice.poNumber || "-"}</p>
              </div>
            </div>

            {invoice.lineItems && invoice.lineItems.length > 0 && (
              <div>
                <p className="mb-4 text-sm font-medium text-slate-400">
                  Line Items
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
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
                    {invoice.lineItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="px-4 py-2 text-slate-100">
                          {item.description}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-100">
                          {item.qty}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-100">
                          {formatCurrency(item.unitPrice, invoice.currency)}
                        </td>
                        <td className="px-4 py-2 text-right text-slate-100">
                          {formatCurrency(item.total, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-slate-100">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-white/10 pt-2">
                    <span className="text-slate-100">Total</span>
                    <span className="text-indigo-400">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {invoice.rejectionReason && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                <p className="text-sm font-medium text-rose-400 mb-1">
                  Rejection Reason
                </p>
                <p className="text-sm text-rose-300">
                  {invoice.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Details */}
      {vendor && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">
              Vendor Details
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-400">Name</p>
                <p className="mt-1 text-slate-100 font-medium">{vendor.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="mt-1 text-slate-100">{vendor.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Phone</p>
                <p className="mt-1 text-slate-100">{vendor.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p className="mt-1">
                  {vendor.isVerified ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-slate-400">Pending</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Address</p>
                <p className="mt-1 text-slate-100">{vendor.address || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">GSTIN</p>
                <p className="mt-1 text-slate-100">{vendor.gstin || "-"}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/vendors/${vendor.id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Vendor Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PO Details */}
      {po && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">
              Purchase Order Details
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-400">PO Number</p>
                <p className="mt-1 text-slate-100 font-medium">{po.poNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p className="mt-1">
                  <Badge status={po.status} />
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Approved Amount</p>
                <p className="mt-1 text-slate-100">
                  {formatCurrency(po.approvedAmount, po.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Remaining Amount</p>
                <p className="mt-1 text-slate-100">
                  {formatCurrency(po.remainingAmount, po.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Delivery Date</p>
                <p className="mt-1 text-slate-100">
                  {po.deliveryDate ? formatDate(po.deliveryDate) : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Description</p>
                <p className="mt-1 text-slate-100">{po.description || "-"}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/purchase-orders/${po.id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full PO Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Review Actions */}
      {canApprove || canReject ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-100">
                  Manual Review
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Approve or reject this invoice after review
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectModal(true)}
                  isLoading={updateStatusMutation.isPending}
                  disabled={!canReject}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApprove}
                  isLoading={updateStatusMutation.isPending}
                  disabled={!canApprove}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : invoice.status === "approved" ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-100">
                  Payment Actions
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Process payment for this approved invoice
                </p>
              </div>
              <div className="flex gap-3">
                <PaymentButton
                  invoice={invoice}
                  onClick={handlePaymentClick}
                  isProcessing={createPaymentMutation.isPending}
                />
                <PayoutButton
                  invoice={invoice}
                  onClick={handlePayoutClick}
                  isProcessing={createPayoutMutation.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">
              This invoice cannot be modified in its current status (
              {invoice.status})
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason("");
        }}
        title="Reject Invoice"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this invoice is being rejected..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              isLoading={updateStatusMutation.isPending}
              className="flex-1"
            >
              Reject Invoice
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        invoice={invoice}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        isProcessing={createPaymentMutation.isPending}
      />
    </div>
  );
}
