import React, { useState, useEffect } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { invoiceService } from '@/api/invoices';
import { CreateInvoicePayload, UploadToken } from '@/types';
import toast from 'react-hot-toast';

export default function VendorUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [vendorEmail, setVendorEmail] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(true);
  const [uploadToken, setUploadToken] = useState<UploadToken | null>(null);

  useEffect(() => {
    // Extract token from URL and validate
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    console.log(error);
    
    if (!token) {
      setError('Invalid or expired upload link');
      setIsValidating(false);
      return;
    }

    validateToken(token);
  }, []);

  const validateToken = async (token: string) => {
    try {
      const validatedToken = await invoiceService.validateUploadToken(token);
      setUploadToken(validatedToken);
      setVendorEmail(validatedToken.vendorEmail);
      if (validatedToken.poNumber) {
        setPoNumber(validatedToken.poNumber);
      }
      setError('');
    } catch (err) {
      setError('Invalid or expired upload link');
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF, PNG, or JPG file');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    if (!uploadToken) {
      toast.error('Invalid upload token');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendorEmail', vendorEmail);
      if (uploadToken.vendorId) {
        formData.append('vendorId', uploadToken.vendorId);
      }
      if (poNumber) {
        formData.append('poNumber', poNumber);
      }

      // Upload invoice using the API endpoint
      await invoiceService.uploadInvoice(formData);

      setUploadSuccess(true);
      toast.success('Invoice uploaded successfully');
      setFile(null);
    } catch (err) {
      setError('Failed to upload invoice. Please try again.');
      toast.error('Upload failed');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Validating upload link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && error.includes('Invalid')) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h1 className="text-2xl font-bold text-slate-100 mb-2">Link Expired</h1>
              <p className="text-slate-400">This upload link is invalid or has expired. Please request a new link from your administrator.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-2xl font-bold text-slate-100 mb-2">Upload Successful</h1>
              <p className="text-slate-400 mb-6">Your invoice has been received and is being processed.</p>
              <Button
                variant="primary"
                onClick={() => {
                  setUploadSuccess(false);
                  setFile(null);
                }}
                className="w-full"
              >
                Upload Another Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">IP</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Upload Invoice</h1>
            <p className="text-slate-400 mb-8">Securely upload your invoice document</p>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-white/10 rounded-lg p-8 hover:border-indigo-500 transition-colors cursor-pointer mb-6"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-sm text-slate-100 mb-1">Drag and drop your invoice</p>
              <p className="text-xs text-slate-400">or click to browse (PDF, PNG, JPG)</p>
              {file && <p className="text-xs text-green-400 mt-2">✓ {file.name}</p>}
            </div>

            <input
              id="file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">Your Email</label>
                <input
                  type="email"
                  value={vendorEmail}
                  disabled
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 opacity-60"
                />
              </div>
              {poNumber && (
                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">PO Number</label>
                  <input
                    type="text"
                    value={poNumber}
                    disabled
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 opacity-60"
                  />
                </div>
              )}
            </div>

            <Button
              variant="primary"
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={!file}
              className="w-full"
            >
              Upload Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
