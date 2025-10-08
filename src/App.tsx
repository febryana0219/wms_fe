import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Warehouses } from './pages/Warehouses';
import { Inbound } from './pages/Inbound';
import { Outbound } from './pages/Outbound';
import { Orders } from './pages/Orders';
import { Transactions } from './pages/Transactions';
import { RouterHandler } from './components/RouterHandler';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <RouterHandler />
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="warehouses" element={
                    <ProtectedRoute requiredRole="admin">
                      <Warehouses />
                    </ProtectedRoute>
                  } />
                  <Route path="inbound" element={<Inbound />} />
                  <Route path="outbound" element={<Outbound />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="transactions" element={<Transactions />} />
                </Route>
                {/* Catch-all route for unmatched paths */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}