import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../components/guards/ProtectedRoute";
import AdminDashboardPage from "../../features/admin/pages/AdminDashboardPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import FollowersPage from "../../features/follow/pages/FollowersPage";
import ProfilePage from "../../features/profile/pages/ProfilePage";
import SearchPage from "../../features/search/pages/SearchPage";
import SettingsPage from "../../features/settings/pages/SettingsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/profile" replace />} />

        {/* Authentication routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public profile and follow routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/u/:username" element={<ProfilePage />} />
        <Route path="/u/:username/followers" element={<FollowersPage />} />
        <Route path="/u/:username/following" element={<FollowersPage />} />

        {/* Protected settings routes */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Global Search route */}
        <Route path="/search" element={<SearchPage />} />

        {/* Super Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </BrowserRouter>
  );
}