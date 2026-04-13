import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Proposals } from '@/pages/Proposals';
import { ProposalBuilder } from '@/pages/ProposalBuilder';
import { ProposalDetail } from '@/pages/ProposalDetail';
import { PublicProposal } from '@/pages/PublicProposal';
import { Clients } from '@/pages/Clients';
import { Services } from '@/pages/Services';
import { Templates } from '@/pages/Templates';
import { ContentLibrary } from '@/pages/ContentLibrary';
import { Pipeline } from '@/pages/Pipeline';
import { Contracts } from '@/pages/Contracts';
import { Invoices } from '@/pages/Invoices';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Notifications } from '@/pages/Notifications';
import { Webhooks } from '@/pages/Webhooks';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/p/:token" element={<PublicProposal />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="proposals/new" element={<ProposalBuilder />} />
          <Route path="proposals/:id" element={<ProposalDetail />} />
          <Route path="proposals/:id/edit" element={<ProposalBuilder />} />
          <Route path="clients" element={<Clients />} />
          <Route path="services" element={<Services />} />
          <Route path="templates" element={<Templates />} />
          <Route path="content-library" element={<ContentLibrary />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="webhooks" element={<Webhooks />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
