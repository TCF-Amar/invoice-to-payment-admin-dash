import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/useUIStore';
import toast from 'react-hot-toast';

export default function Settings() {
  const { apiBaseUrl, setApiBaseUrl, jwtSecret, setJwtSecret, theme, toggleTheme } = useUIStore();
  const [tempApiUrl, setTempApiUrl] = useState(apiBaseUrl);
  const [tempSecret, setTempSecret] = useState(jwtSecret);

  const handleSaveApi = () => {
    if (!tempApiUrl) {
      toast.error('API URL cannot be empty');
      return;
    }
    setApiBaseUrl(tempApiUrl);
    toast.success('API URL saved');
  };

  const handleSaveSecret = () => {
    if (!tempSecret) {
      toast.error('JWT Secret cannot be empty');
      return;
    }
    setJwtSecret(tempSecret);
    toast.success('JWT Secret saved');
  };

  return (
    <div>
      <PageHeader title="Settings" description="Configure your application" />

      <div className="space-y-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">API Configuration</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">API Base URL</label>
              <input
                type="text"
                value={tempApiUrl}
                onChange={(e) => setTempApiUrl(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-2 text-xs text-slate-400">Default: http://localhost:3000/api/v1</p>
            </div>
            <Button variant="primary" onClick={handleSaveApi}>
              Save API URL
            </Button>
          </CardContent>
        </Card>

        {/* JWT Configuration */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">JWT Configuration</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">JWT Secret</label>
              <input
                type="password"
                value={tempSecret}
                onChange={(e) => setTempSecret(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-2 text-xs text-slate-400">Used for generating secure upload links</p>
            </div>
            <Button variant="primary" onClick={handleSaveSecret}>
              Save JWT Secret
            </Button>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-100">Theme</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-100">Dark Mode</p>
                <p className="text-sm text-slate-400">Currently: {theme === 'dark' ? 'Enabled' : 'Disabled'}</p>
              </div>
              <Button variant="ghost" onClick={toggleTheme}>
                Toggle Theme
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
