import React, { useCallback } from 'react';
import { Copy, Mail, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  formatExpirationDisplay,
  formatExpirationRelative,
  isExpiringSoon,
} from '@/utils/uploadLinkUtils';

interface GeneratedLinkDisplayProps {
  generatedUrl: string;
  expiresAt: string;
  vendorEmail: string;
  emailSent: boolean;
  isSendingEmail: boolean;
  onSendEmail: () => Promise<void>;
  onGenerateNewLink: () => void;
}

export const GeneratedLinkDisplay: React.FC<GeneratedLinkDisplayProps> = ({
  generatedUrl,
  expiresAt,
  vendorEmail,
  emailSent,
  isSendingEmail,
  onSendEmail,
  onGenerateNewLink,
}) => {
  const handleCopyClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast.success('Link copied to clipboard');
    } catch {
      // Fallback: show error and let user manually copy
      toast.error('Failed to copy link. Please copy manually.');
    }
  }, [generatedUrl]);

  const handleSendEmailClick = useCallback(async () => {
    try {
      await onSendEmail();
    } catch {
      // Error is already handled by parent component
    }
  }, [onSendEmail]);

  return (
    <Card className="bg-white/5 border border-white/10">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Generated Link Display */}
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">Upload Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={generatedUrl}
                readOnly
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="md"
                onClick={handleCopyClick}
                className="flex-shrink-0"
                title="Copy link to clipboard"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col items-center gap-2">
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG
                value={generatedUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-slate-400">Scan to open upload link</p>
          </div>

          {/* Expiration Information */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">
                <span className="font-medium text-slate-100">Expires:</span> {formatExpirationRelative(expiresAt)}
              </p>
              <p className="text-sm text-slate-400">
                <span className="font-medium text-slate-100">At:</span> {formatExpirationDisplay(expiresAt)}
              </p>
              {isExpiringSoon(expiresAt) && (
                <div className="flex gap-2 mt-2 p-2 bg-amber-500/10 rounded border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">This link is expiring soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Email Sent Status */}
          {emailSent && (
            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="flex gap-2 items-center">
                <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <p className="text-sm text-emerald-300">
                  Email sent successfully to {vendorEmail}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={onGenerateNewLink}
              className="flex items-center gap-2"
              title="Generate a new upload link"
            >
              <RefreshCw className="h-4 w-4" />
              Generate New Link
            </Button>
            <Button
              variant="primary"
              onClick={handleSendEmailClick}
              isLoading={isSendingEmail}
              disabled={emailSent}
              className="flex items-center gap-2"
              title={emailSent ? 'Email already sent' : 'Send upload link via email'}
            >
              <Mail className="h-4 w-4" />
              {emailSent ? 'Email Sent' : 'Send via Email'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneratedLinkDisplay;
