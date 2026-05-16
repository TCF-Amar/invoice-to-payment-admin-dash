import { useState } from 'react';
import { Copy, Mail, CheckCircle } from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { invoiceService } from '@/api/invoices';
import { SendUploadLinkPayload } from '@/types';
import toast from 'react-hot-toast';

export default function UploadLinkGenerator() {
  const [vendorEmail, setVendorEmail] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [expiresIn, setExpiresIn] = useState<'1h' | '24h' | '7d'>('24h');
  const [generatedToken, setGeneratedToken] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const buildUploadUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/vendor-upload?token=${token}`;
  };

  const handleGenerate = async () => {
    if (!vendorEmail) {
      toast.error('Please enter vendor email');
      return;
    }

    setIsLoading(true);
    try {
      const payload: SendUploadLinkPayload = {
        uploadUrl: "",
        vendorEmail,
        poNumber: poNumber || undefined,
        expiresIn,
      };

      const response = await invoiceService.generateUploadLink(payload);
      
      // Use url from response if available, otherwise build it from token
      const url = response.url || buildUploadUrl(response.token || '');
      
      setGeneratedToken(response.token || '');
      setGeneratedUrl(url);
      setEmailSent(false);
      toast.success('Upload link generated');
    } catch (error) {
      toast.error('Failed to generate link');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    toast.success('Link copied to clipboard');
  };

  const handleSendEmail = async () => {
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
      const payload: SendUploadLinkPayload = {
        vendorEmail,
        poNumber: poNumber || undefined,
        expiresIn,
        uploadUrl: generatedUrl,
      };

      console.log('Sending email with payload:', payload);
      await invoiceService.sendUploadLink(payload);
      setEmailSent(true);
      toast.success('Upload link sent to vendor email');
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
      console.error(error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleReset = () => {
    setVendorEmail('');
    setPoNumber('');
    setExpiresIn('24h');
    setGeneratedToken('');
    setGeneratedUrl('');
    setEmailSent(false);
  };

  return (
    <div>
      <PageHeader 
        title="Generate Secure Upload Link" 
        description="Create and send secure links for vendors to upload invoices" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">Generate Link</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">Vendor Email *</label>
              <input
                type="email"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                placeholder="vendor@example.com"
                disabled={!!generatedToken}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">PO Number (Optional)</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="PO-2024-001"
                disabled={!!generatedToken}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">Link Expiry</label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value as any)}
                disabled={!!generatedToken}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none disabled:opacity-60"
              >
                <option value="1h">1 Hour</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
              </select>
            </div>

            {!generatedToken ? (
              <Button variant="primary" onClick={handleGenerate} isLoading={isLoading} className="w-full">
                Generate Link
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleReset} className="w-full">
                Generate New Link
              </Button>
            )}
          </CardContent>
        </Card>

        {generatedUrl && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-100">Generated Link</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailSent && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm text-green-400">Email sent successfully to {vendorEmail}</p>
                </div>
              )}

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-xs text-slate-400 mb-2">Upload Link:</p>
                <p className="text-xs text-slate-100 break-all font-mono">{generatedUrl}</p>
              </div>

              <Button variant="primary" onClick={handleCopy} className="w-full">
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>

              <Button
                variant="ghost"
                onClick={handleSendEmail}
                isLoading={isSendingEmail}
                disabled={emailSent}
                className="w-full"
              >
                <Mail className="h-4 w-4" />
                {emailSent ? 'Email Sent' : 'Send via Email'}
              </Button>

              <div className="flex justify-center p-4 bg-white/5 rounded-lg border border-white/10">
                <QRCode
                  value={generatedUrl}
                  size={200}
                  level="H"
                  fgColor="#ffffff"
                  bgColor="#0a0c10"
                />
              </div>
              <p className="text-xs text-slate-400 text-center">Scan to open upload link</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
