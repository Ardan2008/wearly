import { requireRole } from "@/lib/auth-guard";
import { CategoryManagementPage } from "@/components/categories/category-management-page";

export default async function AdminCategoriesPage() {
  await requireRole("ADMIN");

  return (
    <CategoryManagementPage basePath="/admin/categories" />
  );
}
