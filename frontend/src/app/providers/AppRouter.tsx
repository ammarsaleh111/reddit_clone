import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../components/guards/ProtectedRoute";
import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import FollowersPage from "../../features/follow/pages/FollowersPage";
import ProfilePage from "../../features/profile/pages/ProfilePage";
import SearchPage from "../../features/search/pages/SearchPage";
import SettingsPage from "../../features/settings/pages/SettingsPage";
import HomePage from "../../feed/pages/HomePage";
import PostDetailPage from "../../feed/pages/PostDetailPage";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Home Feed route */}
        <Route path="/" element={<HomePage />} />

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

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/post/:postId" element={<PostDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
