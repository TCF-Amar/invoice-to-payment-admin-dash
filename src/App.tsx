import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import VendorList from '@/pages/vendors/VendorList';
import VendorDetail from '@/pages/vendors/VendorDetail';
import POList from '@/pages/purchase-orders/POList';
import POCreate from '@/pages/purchase-orders/POCreate';
import PODetail from '@/pages/purchase-orders/PODetail';
import InvoiceList from '@/pages/invoices/InvoiceList';
import InvoiceDetail from '@/pages/invoices/InvoiceDetail';
import UploadLinkGenerator from '@/pages/invoices/UploadLinkGenerator';
import VendorUpload from '@/pages/invoices/VendorUpload';
import PayoutDashboard from '@/pages/payouts/PayoutDashboard';
import TicketList from '@/pages/tickets/TicketList';
import TicketDetail from '@/pages/tickets/TicketDetail';
import Settings from '@/pages/settings/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/vendor-upload" element={<VendorUpload />} />
          <Route
            path="/*"
            element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/vendors" element={<VendorList />} />
                  <Route path="/vendors/:id" element={<VendorDetail />} />
                  <Route path="/purchase-orders" element={<POList />} />
                  <Route path="/purchase-orders/new" element={<POCreate />} />
                  <Route path="/purchase-orders/:id" element={<PODetail />} />
                  <Route path="/invoices" element={<InvoiceList />} />
                  <Route path="/invoices/:id" element={<InvoiceDetail />} />
                  <Route path="/invoices/upload-link" element={<UploadLinkGenerator />} />
                  <Route path="/payouts" element={<PayoutDashboard />} />
                  <Route path="/tickets" element={<TicketList />} />
                  <Route path="/tickets/:id" element={<TicketDetail />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </AppLayout>
            }
          />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
