import { requireRole } from "@/lib/auth-guard";
import { CategoryManagementPage } from "@/components/categories/category-management-page";

export default async function OwnerCategoriesPage() {
  await requireRole("OWNER");

  return (
    <CategoryManagementPage basePath="/owner/categories" />
  );
}
