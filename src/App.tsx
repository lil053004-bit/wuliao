import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RefactoredHome from './pages/RefactoredHome';
import { initializeGoogleTracking } from './lib/googleTracking';

const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const SpecifiedCommercialTransactionAct = lazy(() => import('./pages/SpecifiedCommercialTransactionAct'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  useEffect(() => {
    initializeGoogleTracking();
  }, []);

  return (
    <>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<RefactoredHome />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/specified-commercial-transaction-act" element={<SpecifiedCommercialTransactionAct />} />

          <Route path="/adsadmin" element={<AdminLogin />} />
          <Route
            path="/adsadmin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
