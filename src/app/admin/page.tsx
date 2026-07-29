import type { Metadata } from "next";
import AdminRoute from "./_components/AdminRoute";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminRoutePage() {
  return <AdminRoute />;
}
