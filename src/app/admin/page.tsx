import type { Metadata } from "next";
import AdminRoute from "../components/AdminRoute";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminRoutePage() {
  return <AdminRoute />;
}
