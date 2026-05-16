import React, { useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { PurchaseOrder, GeneratedLinkMetadata } from '@/types';
import { UploadLinkForm } from './UploadLinkForm';
import { GeneratedLinkDisplay } from './GeneratedLinkDisplay';
import { invoiceService } from '@/api/invoices';
import {
  buildUploadUrl,
  validateVendorEmail,
} from '@/utils/uploadLinkUtils';

interface InvoiceUploadManagerProps {
  po: PurchaseOrder;
  onLinkGenerated?: (link: GeneratedLinkMetadata) => void;
  onEmailSent?: () => void;
}

export const InvoiceUploadManager: React.FC<InvoiceUploadManagerProps> = ({
  po,
  onLinkGenerated,
  onEmailSent,
}) => {
  // Form inputs
  const [vendorEmail, setVendorEmail] = useState(po.vendor?.email || '');
  const [expiresIn, setExpiresIn] = useState<'1h' | '24h' | '7d'>('24h');

  // Generated link
  const [generatedToken, setGeneratedToken] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);

  // Check if PO is delivered
  const isDelivered = po.status === 'delivered';

  const handleGenerateLink = useCallback(async () => {
    // Validate vendor email
    const validation = validateVendorEmail(vendorEmail);
    if (!validation.isValid) {
      toast.error(validation.error || 'Please enter a valid email address');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await invoiceService.generateUploadLink({
        vendorEmail: vendorEmail.trim(),
        poNumber: po.poNumber,
        expiresIn,
        uploadUrl: '',
      });
console.log(response);

      // Use the uploadUrl from the response directly
      const uploadUrl = response.url || buildUploadUrl(response.token || '', po.poNumber);

      // Update state
      setGeneratedToken(response.token || '');
      setGeneratedUrl(uploadUrl);
      setExpiresAt(response.expiresAt || '');
      setFormDisabled(true);
      setEmailSent(false);

      // Call optional callback
      if (onLinkGenerated) {
        onLinkGenerated(response);
      }

      toast.success('Upload link generated');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to generate link';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [vendorEmail, po.poNumber, expiresIn, onLinkGenerated]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast.success('Link copied to clipboard');
    } catch {
      // Fallback: show error and let user manually copy
      toast.error('Failed to copy link. Please copy manually.');
    }
  }, [generatedUrl]);

  const handleSendEmail = useCallback(async () => {
    if (!generatedToken) {
      toast.error('Please generate a link first');
      return;
    }

    if (!generatedUrl) {
      toast.error('Upload URL is missing. Please generate the link again.');
      return;
    }

    setIsSendingEmail(true);
    try {
      await invoiceService.sendUploadLink({
        vendorEmail: vendorEmail.trim(),
        poNumber: po.poNumber,
        expiresIn,
        uploadUrl: generatedUrl,
      });

      setEmailSent(true);

      // Call optional callback
      if (onEmailSent) {
        onEmailSent();
      }

      toast.success('Upload link sent to vendor email');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to send email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSendingEmail(false);
    }
  }, [generatedToken, generatedUrl, vendorEmail, po.poNumber, expiresIn, onEmailSent]);

  const handleGenerateNewLink = useCallback(() => {
    // Reset all state
    setGeneratedToken('');
    setGeneratedUrl('');
    setExpiresAt(null);
    setEmailSent(false);
    setFormDisabled(false);
    setVendorEmail(po.vendor?.email || '');
    setExpiresIn('24h');
  }, [po.vendor?.email]);

  // If PO is not delivered, show message
  if (!isDelivered) {
    return (
      <div className="flex gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
        <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-300">
          Invoice upload is available only for delivered purchase orders
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-slate-100">Upload Invoice Link</h3>
        <p className="mt-1 text-sm text-slate-400">
          Generate and share secure upload links with vendors to submit invoices for this purchase order
        </p>
      </div>

      {/* Form or Generated Link Display */}
      {!generatedToken ? (
        // Form State
        <UploadLinkForm
          vendorEmail={vendorEmail}
          onVendorEmailChange={setVendorEmail}
          poNumber={po.poNumber}
          expiresIn={expiresIn}
          onExpiresInChange={setExpiresIn}
          onGenerateLink={handleGenerateLink}
          isLoading={isGenerating}
          disabled={formDisabled}
        />
      ) : (
        // Generated Link Display State
        <GeneratedLinkDisplay
          generatedUrl={generatedUrl}
          expiresAt={expiresAt || ''}
          vendorEmail={vendorEmail}
          emailSent={emailSent}
          isSendingEmail={isSendingEmail}
          onSendEmail={handleSendEmail}
          onGenerateNewLink={handleGenerateNewLink}
        />
      )}
    </div>
  );
};

export default InvoiceUploadManager;
