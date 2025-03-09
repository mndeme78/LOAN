import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import UserDashboard from "@/pages/user/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import LoanApplication from "@/pages/user/LoanApplication";
import MyLoans from "@/pages/user/MyLoans";
import LoanApproval from "@/pages/admin/LoanApproval";
import UserManagement from "@/pages/admin/UserManagement";
import UserLoans from "@/pages/admin/UserLoans";
import AdminSettings from "@/pages/admin/AdminSettings";
import AccountPage from "@/pages/user/AccountPage";
import NotificationsPage from "@/pages/user/NotificationsPage";
import PaymentOptions from "@/pages/user/PaymentOptions";
import PaymentMethodsPage from "@/pages/user/PaymentMethodsPage";
import routes from "tempo-routes";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected user routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans/apply"
              element={
                <ProtectedRoute requiredRole="user">
                  <LoanApplication />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans"
              element={
                <ProtectedRoute requiredRole="user">
                  <MyLoans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute requiredRole="user">
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute requiredRole="user">
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute requiredRole="user">
                  <PaymentOptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-methods"
              element={
                <ProtectedRoute requiredRole="user">
                  <PaymentMethodsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-methods/:type"
              element={
                <ProtectedRoute requiredRole="user">
                  <PaymentMethodsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/loans/approval"
              element={
                <ProtectedRoute requiredRole="admin">
                  <LoanApproval />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute requiredRole="admin">
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:userId"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserLoans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to appropriate dashboard based on role */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Tempo routes */}
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
