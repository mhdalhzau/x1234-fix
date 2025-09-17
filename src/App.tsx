import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TwoFactorPage from './pages/TwoFactorPage';
import DashboardPage from './pages/DashboardPage';
import OutletsPage from './pages/OutletsPage';
import BillingPage from './pages/BillingPage';
import AdminPage from './pages/AdminPage';

// Subscription pages
import PlansPage from './pages/subscriptions/PlansPage';

// Content pages
import BlogPage from './pages/content/BlogPage';

// Communication pages
import EmailTemplatesPage from './pages/communications/EmailTemplatesPage';

// Organization pages
import TenantsPage from './pages/organizations/TenantsPage';

// Settings pages
import GeneralSettingsPage from './pages/settings/GeneralSettingsPage';

// Integration pages
import APIManagementPage from './pages/integrations/APIManagementPage';

// Branding pages
import ThemeSettingsPage from './pages/branding/ThemeSettingsPage';

// Analytics pages
import MetricsPage from './pages/analytics/MetricsPage';
import UserAnalyticsPage from './pages/analytics/UserAnalyticsPage';
import SubscriptionAnalyticsPage from './pages/analytics/SubscriptionAnalyticsPage';
import RevenueAnalyticsPage from './pages/analytics/RevenueAnalyticsPage';
import SuperAdminRoute from './components/SuperAdminRoute';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />
      <Route
        path="/two-factor"
        element={
          <PublicRoute>
            <TwoFactorPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/outlets"
        element={
          <ProtectedRoute>
            <OutletsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      
      {/* Subscription routes */}
      <Route
        path="/subscriptions/plans"
        element={
          <ProtectedRoute>
            <PlansPage />
          </ProtectedRoute>
        }
      />
      
      {/* Content routes */}
      <Route
        path="/content/blog"
        element={
          <ProtectedRoute>
            <BlogPage />
          </ProtectedRoute>
        }
      />
      
      {/* Communication routes */}
      <Route
        path="/communications/templates"
        element={
          <ProtectedRoute>
            <EmailTemplatesPage />
          </ProtectedRoute>
        }
      />
      
      {/* Organization routes */}
      <Route
        path="/organizations/tenants"
        element={
          <ProtectedRoute>
            <TenantsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Settings routes */}
      <Route
        path="/settings/general"
        element={
          <ProtectedRoute>
            <GeneralSettingsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Integration routes */}
      <Route
        path="/integrations/api"
        element={
          <ProtectedRoute>
            <APIManagementPage />
          </ProtectedRoute>
        }
      />
      
      {/* Branding routes */}
      <Route
        path="/branding/theme"
        element={
          <ProtectedRoute>
            <ThemeSettingsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Analytics routes - Superadmin only */}
      <Route
        path="/analytics/metrics"
        element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <MetricsPage />
            </SuperAdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/users"
        element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <UserAnalyticsPage />
            </SuperAdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/subscriptions"
        element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <SubscriptionAnalyticsPage />
            </SuperAdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/revenue"
        element={
          <ProtectedRoute>
            <SuperAdminRoute>
              <RevenueAnalyticsPage />
            </SuperAdminRoute>
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;