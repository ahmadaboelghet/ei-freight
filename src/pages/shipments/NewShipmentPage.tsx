/**
 * @file src/pages/shipments/NewShipmentPage.tsx
 * @description Renders the CreateShipmentForm inside the main AppLayout.
 */

import React from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { CreateShipmentForm } from "../../components/forms/CreateShipmentForm";

export function NewShipmentPage() {
  return (
    <AppLayout>
      <CreateShipmentForm />
    </AppLayout>
  );
}
