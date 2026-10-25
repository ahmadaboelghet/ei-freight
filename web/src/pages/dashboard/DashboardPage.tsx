/**
 * @file src/pages/dashboard/DashboardPage.tsx
 * @description Master Dashboard Dispatcher — automatically renders the appropriate
 *              dashboard view based on user role (Client, Provider, Operations, Admin)
 *              matching the EI Freight prototype architecture.
 */

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ClientDashboard } from "./ClientDashboard";
import { ProviderDashboard } from "./ProviderDashboard";
import { OperationsDashboard } from "./OperationsDashboard";
import { AdminDashboard } from "./AdminDashboard";

export function DashboardPage() {
  const { user } = useAuth();

  const role = user?.role;
  const internalRole = user?.internalRole;

  // 1. Super Admin
  if (role === "admin" || internalRole === "super_admin") {
    return <AdminDashboard />;
  }

  // 2. Operations Staff
  if (role === "staff" || internalRole === "operations") {
    return <OperationsDashboard />;
  }

  // 3. Service Provider / Carrier
  if (role === "provider") {
    return <ProviderDashboard />;
  }

  // 4. Client (Personal or Business)
  return <ClientDashboard />;
}
