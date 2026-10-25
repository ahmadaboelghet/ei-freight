/**
 * @file src/components/layout/ProtectedRoute.tsx
 * @description Wraps routes that require authentication (and optionally a specific role).
 *              Redirects to /login if unauthenticated, shows a spinner during loading.
 */

import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/domain";

interface ProtectedRouteProps {
  children: ReactNode;
  /** If provided, user must have one of these roles to access the route. */
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ── Auth observer hasn't settled yet — show a full-screen spinner ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span className="text-sm text-slate-500 font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  // ── Not authenticated → redirect to login, preserve intended URL ──
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Wrong role → redirect to dashboard ──
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
