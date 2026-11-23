import { requireRole } from "@/lib/auth-guard";
import { ProductManagementPage } from "@/components/products/product-management-page";

export default async function AdminProductsPage() {
  await requireRole("ADMIN");

  return (
    <ProductManagementPage basePath="/admin/products" />
  );
}
