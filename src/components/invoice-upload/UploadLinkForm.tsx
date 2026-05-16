import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface UploadLinkFormProps {
  vendorEmail: string;
  onVendorEmailChange: (email: string) => void;
  poNumber: string;
  expiresIn: '1h' | '24h' | '7d';
  onExpiresInChange: (duration: '1h' | '24h' | '7d') => void;
  onGenerateLink: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const UploadLinkForm: React.FC<UploadLinkFormProps> = ({
  vendorEmail,
  onVendorEmailChange,
  poNumber,
  expiresIn,
  onExpiresInChange,
  onGenerateLink,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Vendor Email Field */}
          <div>
            <label htmlFor="vendor-email" className="block text-sm font-medium text-slate-100 mb-2">
              Vendor Email <span className="text-rose-400">*</span>
            </label>
            <input
              id="vendor-email"
              type="email"
              value={vendorEmail}
              onChange={(e) => onVendorEmailChange(e.target.value)}
              placeholder="vendor@example.com"
              disabled={disabled}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Vendor email address"
              aria-required="true"
            />
          </div>

          {/* PO Number Field */}
          <div>
            <label htmlFor="po-number" className="block text-sm font-medium text-slate-100 mb-2">
              PO Number
            </label>
            <input
              id="po-number"
              type="text"
              value={poNumber}
              disabled
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Purchase order number (read-only)"
              aria-disabled="true"
            />
          </div>

          {/* Link Expiry Field */}
          <div>
            <label htmlFor="link-expiry" className="block text-sm font-medium text-slate-100 mb-2">
              Link Expiry
            </label>
            <select
              id="link-expiry"
              value={expiresIn}
              onChange={(e) => onExpiresInChange(e.target.value as '1h' | '24h' | '7d')}
              disabled={disabled}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Link expiration duration"
            >
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
            </select>
          </div>

          {/* Generate Link Button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={onGenerateLink}
              isLoading={isLoading}
              disabled={disabled || isLoading}
              aria-busy={isLoading}
            >
              Generate Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadLinkForm;
