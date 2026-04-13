import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { Clients } from '@/pages/Clients';
import { ServiceCatalog } from '@/pages/ServiceCatalog';
import { Proposals } from '@/pages/Proposals';
import { ProposalBuilder } from '@/pages/ProposalBuilder';
import { PublicProposal } from '@/pages/PublicProposal';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/p/:token" element={<PublicProposal />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="services" element={<ServiceCatalog />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="proposals/new" element={<ProposalBuilder />} />
          <Route path="proposals/:id/edit" element={<ProposalBuilder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
